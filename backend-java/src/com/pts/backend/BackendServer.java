package com.pts.backend;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * High-Performance Java Backend Server for Placement Preparation and Tracking System
 * Runs on Java 24 (or Java 17+)
 * - Serves Static Web Application (replaces python http.server)
 * - Provides REST API endpoints connected to Supabase
 * - Integrates Supabase Cloud Storage for PDF/DOCX resumes
 */
public class BackendServer {

    private static int PORT = 8080;
    private static String SUPABASE_URL = "https://qtsothmldarlqybjyfwb.supabase.co";
    private static String SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0c290aG1sZGFybHF5Ymp5ZndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjg1ODQsImV4cCI6MjEwNTc0NDU4NH0.T5vo1yMAbTDgy_vQ8gM6CbFbAPHwZ3GlrCPRLkTn3Xc";
    private static String STORAGE_BUCKET = "resumes";
    private static Path STATIC_ROOT;

    private static SupabaseStorageClient storageClient;
    private static HttpClient httpClient;

    public static void main(String[] args) {
        try {
            loadConfig();

            storageClient = new SupabaseStorageClient(SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET);
            httpClient = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_2)
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            HttpServer server = null;
            int portAttempts = 0;
            int currentPort = PORT;
            while (server == null && portAttempts < 10) {
                try {
                    server = HttpServer.create(new InetSocketAddress(currentPort), 0);
                    PORT = currentPort;
                } catch (java.net.BindException be) {
                    System.out.printf("[PTS] Notice: Port %d is busy. Trying port %d...%n", currentPort, currentPort + 1);
                    currentPort++;
                    portAttempts++;
                }
            }

            if (server == null) {
                throw new java.net.BindException("Failed to bind to any port from " + PORT + " to " + (PORT + portAttempts));
            }

            // Use virtual threads on Java 21+ for ultra-lightweight high concurrency
            try {
                server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
            } catch (Throwable t) {
                server.setExecutor(Executors.newFixedThreadPool(32));
            }

            // Register Handlers
            server.createContext("/api/health", new HealthHandler());
            server.createContext("/api/storage/upload", new StorageUploadHandler());
            server.createContext("/api/storage/list", new StorageListHandler());
            server.createContext("/api/storage/url", new StorageUrlHandler());
            server.createContext("/api/storage/delete", new StorageDeleteHandler());
            server.createContext("/api/students", new SupabaseProxyHandler("profiles?role=eq.student"));
            server.createContext("/api/drives", new SupabaseProxyHandler("companies"));
            server.createContext("/api/applications", new SupabaseProxyHandler("applications"));

            // Static File Server handler for root context
            server.createContext("/", new StaticFileHandler());

            server.start();

            printBanner();
            openBrowser("http://localhost:" + PORT + "/");

        } catch (Exception e) {
            System.err.println("Fatal Error starting Java Backend Server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void loadConfig() {
        // Try reading application.properties
        Properties props = new Properties();
        Path propPath = Paths.get("application.properties");
        if (!Files.exists(propPath)) {
            propPath = Paths.get("backend-java/application.properties");
        }

        if (Files.exists(propPath)) {
            try (InputStream is = Files.newInputStream(propPath)) {
                props.load(is);
                if (props.containsKey("server.port")) PORT = Integer.parseInt(props.getProperty("server.port"));
                if (props.containsKey("supabase.url")) SUPABASE_URL = props.getProperty("supabase.url");
                if (props.containsKey("supabase.anon_key")) SUPABASE_ANON_KEY = props.getProperty("supabase.anon_key");
                if (props.containsKey("supabase.storage.bucket")) STORAGE_BUCKET = props.getProperty("supabase.storage.bucket");
            } catch (Exception ignored) {}
        }

        // Determine static files root directory
        Path p1 = Paths.get("index.html");
        Path p2 = Paths.get("../index.html");
        if (Files.exists(p1)) {
            STATIC_ROOT = Paths.get(".").toAbsolutePath().normalize();
        } else if (Files.exists(p2)) {
            STATIC_ROOT = Paths.get("..").toAbsolutePath().normalize();
        } else {
            STATIC_ROOT = Paths.get(".").toAbsolutePath().normalize();
        }
    }

    private static void printBanner() {
        System.out.println("""
==============================================================
☕ Placement System Java Backend Server (Java 24 SE)
==============================================================
🚀 Web Portal URL   : http://localhost:%d/
🩺 Health Check API : http://localhost:%d/api/health
📦 Supabase Storage : http://localhost:%d/api/storage/list
☁️ Supabase Cloud   : %s
📁 Resumes Bucket   : %s
📂 Web Root Dir     : %s
==============================================================
Server is ACTIVE and listening for incoming browser requests...
""".formatted(PORT, PORT, PORT, SUPABASE_URL, STORAGE_BUCKET, STATIC_ROOT));
    }

    // ====================================================================
    // CORS Helper
    // ====================================================================
    private static void handleCors(HttpExchange exchange) {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-upsert");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        handleCors(exchange);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    // ====================================================================
    // 1. Health Handler
    // ====================================================================
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            long start = System.currentTimeMillis();
            String dbStatus = "unknown";
            long latency = -1;

            try {
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(SUPABASE_URL + "/rest/v1/companies?select=id&limit=1"))
                        .timeout(Duration.ofSeconds(5))
                        .header("apikey", SUPABASE_ANON_KEY)
                        .header("Authorization", "Bearer " + SUPABASE_ANON_KEY)
                        .GET()
                        .build();

                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                latency = System.currentTimeMillis() - start;
                dbStatus = resp.statusCode() == 200 ? "connected" : "status_" + resp.statusCode();
            } catch (Exception e) {
                dbStatus = "error: " + e.getMessage();
            }

            String json = """
                    {
                      "status": "ok",
                      "runtime": "Java %s (%s)",
                      "server": "Placement Preparation and Tracking System Java Backend",
                      "port": %d,
                      "supabase": {
                        "url": "%s",
                        "status": "%s",
                        "latencyMs": %d,
                        "storageBucket": "%s"
                      }
                    }
                    """.formatted(
                    System.getProperty("java.version"),
                    System.getProperty("java.vendor"),
                    PORT,
                    SUPABASE_URL,
                    dbStatus,
                    latency,
                    STORAGE_BUCKET
            );

            sendJsonResponse(exchange, 200, json);
        }
    }

    // ====================================================================
    // 2. Storage Upload Handler (POST /api/storage/upload)
    // ====================================================================
    static class StorageUploadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }

            try {
                String query = exchange.getRequestURI().getQuery();
                String fileName = getQueryParam(query, "fileName");
                String studentId = getQueryParam(query, "studentId");

                if (fileName == null || fileName.isBlank()) {
                    fileName = "resume_" + System.currentTimeMillis() + ".pdf";
                }
                if (studentId == null || studentId.isBlank()) {
                    studentId = "STU-101";
                }

                // Clean file name
                String safeName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
                String remotePath = studentId + "/" + System.currentTimeMillis() + "_" + safeName;

                // Read incoming request body bytes
                byte[] fileBytes;
                try (InputStream is = exchange.getRequestBody()) {
                    fileBytes = is.readAllBytes();
                }

                if (fileBytes.length == 0) {
                    sendJsonResponse(exchange, 400, "{\"error\":\"Uploaded file body was empty\"}");
                    return;
                }

                String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
                if (contentType == null || contentType.isBlank() || contentType.contains("octet-stream")) {
                    if (safeName.endsWith(".pdf")) contentType = "application/pdf";
                    else if (safeName.endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    else if (safeName.endsWith(".txt")) contentType = "text/plain";
                    else contentType = "application/pdf";
                }

                // Upload to Supabase Storage via Java client
                String resultJson = storageClient.uploadFile(remotePath, fileBytes, contentType);
                sendJsonResponse(exchange, 200, resultJson);

            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"error\":\"Java Storage Upload Exception: " + e.getMessage() + "\"}");
            }
        }
    }

    // ====================================================================
    // 3. Storage List Handler (GET /api/storage/list)
    // ====================================================================
    static class StorageListHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String query = exchange.getRequestURI().getQuery();
                String prefix = getQueryParam(query, "prefix");
                String listJson = storageClient.listFiles(prefix != null ? prefix : "", 100);
                sendJsonResponse(exchange, 200, listJson);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"error\":\"List files error: " + e.getMessage() + "\"}");
            }
        }
    }

    // ====================================================================
    // 4. Storage URL Handler (GET /api/storage/url?file=...)
    // ====================================================================
    static class StorageUrlHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String file = getQueryParam(exchange.getRequestURI().getQuery(), "file");
            if (file == null || file.isBlank()) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Parameter 'file' is required\"}");
                return;
            }

            String url = storageClient.getPublicUrl(file);
            sendJsonResponse(exchange, 200, String.format("{\"success\":true,\"url\":\"%s\",\"file\":\"%s\"}", url, file));
        }
    }

    // ====================================================================
    // 5. Storage Delete Handler (DELETE /api/storage/delete?file=...)
    // ====================================================================
    static class StorageDeleteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String file = getQueryParam(exchange.getRequestURI().getQuery(), "file");
                if (file == null || file.isBlank()) {
                    sendJsonResponse(exchange, 400, "{\"error\":\"Parameter 'file' is required\"}");
                    return;
                }

                String res = storageClient.deleteFile(file);
                sendJsonResponse(exchange, 200, res);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"error\":\"Delete error: " + e.getMessage() + "\"}");
            }
        }
    }

    // ====================================================================
    // 6. Supabase PostgREST Table Proxy Handler
    // ====================================================================
    static class SupabaseProxyHandler implements HttpHandler {
        private final String tablePath;

        public SupabaseProxyHandler(String tablePath) {
            this.tablePath = tablePath;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String method = exchange.getRequestMethod();
                String endpoint = SUPABASE_URL + "/rest/v1/" + tablePath;
                if (exchange.getRequestURI().getQuery() != null) {
                    endpoint += (tablePath.contains("?") ? "&" : "?") + exchange.getRequestURI().getQuery();
                }

                HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .timeout(Duration.ofSeconds(15))
                        .header("apikey", SUPABASE_ANON_KEY)
                        .header("Authorization", "Bearer " + SUPABASE_ANON_KEY);

                if ("POST".equalsIgnoreCase(method)) {
                    byte[] body = exchange.getRequestBody().readAllBytes();
                    reqBuilder.header("Content-Type", "application/json")
                            .header("Prefer", "return=representation")
                            .POST(HttpRequest.BodyPublishers.ofByteArray(body));
                } else if ("PATCH".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                    byte[] body = exchange.getRequestBody().readAllBytes();
                    reqBuilder.header("Content-Type", "application/json")
                            .header("Prefer", "return=representation")
                            .method("PATCH", HttpRequest.BodyPublishers.ofByteArray(body));
                } else {
                    reqBuilder.GET();
                }

                HttpResponse<String> resp = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());
                sendJsonResponse(exchange, resp.statusCode(), resp.body());

            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"error\":\"Supabase proxy error: " + e.getMessage() + "\"}");
            }
        }
    }

    // ====================================================================
    // 7. Static File Handler (Serves HTML, CSS, JS, Images, Icons)
    // ====================================================================
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String pathStr = exchange.getRequestURI().getPath();
            if (pathStr == null || pathStr.equals("/")) {
                pathStr = "/index.html";
            }

            // Prevent path traversal
            if (pathStr.contains("..")) {
                send404(exchange, "Path traversal forbidden");
                return;
            }

            Path filePath = STATIC_ROOT.resolve(pathStr.substring(1)).normalize();

            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                // If requesting a route, fall back to index.html
                Path fallback = STATIC_ROOT.resolve("index.html");
                if (Files.exists(fallback)) {
                    serveFile(exchange, fallback, "text/html; charset=UTF-8");
                    return;
                }
                send404(exchange, "File not found: " + pathStr);
                return;
            }

            String mimeType = getMimeType(filePath.getFileName().toString());
            serveFile(exchange, filePath, mimeType);
        }

        private void serveFile(HttpExchange exchange, Path file, String mimeType) throws IOException {
            byte[] fileBytes = Files.readAllBytes(file);
            Headers headers = exchange.getResponseHeaders();
            headers.set("Content-Type", mimeType);
            headers.set("Cache-Control", "no-cache, must-revalidate");
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }

        private void send404(HttpExchange exchange, String message) throws IOException {
            byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(404, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        private String getMimeType(String name) {
            String lower = name.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
            if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
            if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript; charset=UTF-8";
            if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".gif")) return "image/gif";
            if (lower.endsWith(".ico")) return "image/x-icon";
            if (lower.endsWith(".pdf")) return "application/pdf";
            if (lower.endsWith(".woff2")) return "font/woff2";
            if (lower.endsWith(".woff")) return "font/woff";
            if (lower.endsWith(".ttf")) return "font/ttf";
            return "application/octet-stream";
        }
    }

    private static String getQueryParam(String query, String key) {
        if (query == null || query.isBlank()) return null;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length > 0 && pair[0].equalsIgnoreCase(key)) {
                return pair.length > 1 ? java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8) : "";
            }
        }
        return null;
    }

    private static void openBrowser(String url) {
        try {
            if (java.awt.Desktop.isDesktopSupported() && java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
                java.awt.Desktop.getDesktop().browse(new URI(url));
                return;
            }
        } catch (Throwable ignored) {}
        try {
            new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url).start();
        } catch (Throwable ignored) {}
    }
}
