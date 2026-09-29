package com.pts.backend;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Supabase Cloud Storage Client for Java
 * Connects directly to Supabase Storage REST API
 */
public class SupabaseStorageClient {
    private final String supabaseUrl;
    private final String anonKey;
    private final String bucket;
    private final HttpClient httpClient;

    public SupabaseStorageClient(String supabaseUrl, String anonKey, String bucket) {
        // Strip trailing slash if present
        this.supabaseUrl = supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
        this.anonKey = anonKey;
        this.bucket = bucket;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Upload binary file to Supabase Storage bucket
     */
    public String uploadFile(String remotePath, byte[] fileBytes, String contentType) throws IOException, InterruptedException {
        String cleanPath = remotePath.startsWith("/") ? remotePath.substring(1) : remotePath;
        String endpoint = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, cleanPath);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(30))
                .header("apikey", anonKey)
                .header("Authorization", "Bearer " + anonKey)
                .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                .header("x-upsert", "true")
                .POST(HttpRequest.BodyPublishers.ofByteArray(fileBytes))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int status = response.statusCode();

        if (status >= 200 && status < 300) {
            String publicUrl = getPublicUrl(cleanPath);
            return String.format("{\"success\":true,\"url\":\"%s\",\"path\":\"%s\",\"statusCode\":%d}", publicUrl, cleanPath, status);
        } else {
            return String.format("{\"success\":false,\"error\":\"Supabase upload failed: %s\",\"statusCode\":%d}",
                    escapeJson(response.body()), status);
        }
    }

    /**
     * Get the public download URL for a file in a public bucket
     */
    public String getPublicUrl(String remotePath) {
        String cleanPath = remotePath.startsWith("/") ? remotePath.substring(1) : remotePath;
        return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, cleanPath);
    }

    /**
     * List files in the bucket
     */
    public String listFiles(String prefix, int limit) throws IOException, InterruptedException {
        String endpoint = String.format("%s/storage/v1/object/list/%s", supabaseUrl, bucket);
        String jsonPayload = String.format("{\"prefix\":\"%s\",\"limit\":%d,\"offset\":0,\"sortBy\":{\"column\":\"created_at\",\"order\":\"desc\"}}",
                prefix != null ? prefix : "", limit > 0 ? limit : 100);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("apikey", anonKey)
                .header("Authorization", "Bearer " + anonKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int status = response.statusCode();

        if (status >= 200 && status < 300) {
            return String.format("{\"success\":true,\"files\":%s}", response.body());
        } else {
            return String.format("{\"success\":false,\"error\":\"List failed: %s\",\"statusCode\":%d}",
                    escapeJson(response.body()), status);
        }
    }

    /**
     * Delete a file from the bucket
     */
    public String deleteFile(String remotePath) throws IOException, InterruptedException {
        String cleanPath = remotePath.startsWith("/") ? remotePath.substring(1) : remotePath;
        String endpoint = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, cleanPath);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("apikey", anonKey)
                .header("Authorization", "Bearer " + anonKey)
                .DELETE()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return String.format("{\"success\":%b,\"statusCode\":%d}", response.statusCode() < 300, response.statusCode());
    }

    /**
     * Download binary file from bucket
     */
    public byte[] downloadFile(String remotePath) throws IOException, InterruptedException {
        String cleanPath = remotePath.startsWith("/") ? remotePath.substring(1) : remotePath;
        String endpoint = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, cleanPath);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(30))
                .header("apikey", anonKey)
                .header("Authorization", "Bearer " + anonKey)
                .GET()
                .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        }
        return null;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
