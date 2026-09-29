/**
 * Placement Preparation and Tracking System
 * Supabase Client & Configuration Manager
 */

(function () {
  const STORAGE_KEYS = {
    URL: 'PTS_SUPABASE_URL',
    KEY: 'PTS_SUPABASE_ANON_KEY',
    ENABLED: 'PTS_SUPABASE_ENABLED',
    MODE: 'PTS_BACKEND_MODE' // 'supabase' or 'local'
  };

  // Default fallback credentials (prefilled with user's live Supabase project)
  const DEFAULT_CONFIG = {
    url: 'https://qtsothmldarlqybjyfwb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0c290aG1sZGFybHF5Ymp5ZndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjg1ODQsImV4cCI6MjEwNTc0NDU4NH0.T5vo1yMAbTDgy_vQ8gM6CbFbAPHwZ3GlrCPRLkTn3Xc',
    enabled: true
  };

  class SupabaseClientManager {
    constructor() {
      this.client = null;
      this.isConnected = false;
      this.lastPing = null;
      this.connectionStatus = 'offline'; // 'connected', 'connecting', 'error', 'offline'
      this.statusListeners = [];
      this.init();
    }

    init() {
      const config = this.getConfig();
      if (config.url && config.anonKey && config.enabled !== false) {
        this.initClient(config.url, config.anonKey);
      } else {
        this.connectionStatus = 'offline';
        this.notifyStatusChange();
      }
    }

    getConfig() {
      try {
        const url = localStorage.getItem(STORAGE_KEYS.URL) || DEFAULT_CONFIG.url;
        const anonKey = localStorage.getItem(STORAGE_KEYS.KEY) || DEFAULT_CONFIG.anonKey;
        const enabled = localStorage.getItem(STORAGE_KEYS.ENABLED) !== 'false';
        return { url: url.trim(), anonKey: anonKey.trim(), enabled };
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }

    saveConfig(url, anonKey, enabled = true) {
      try {
        localStorage.setItem(STORAGE_KEYS.URL, (url || '').trim());
        localStorage.setItem(STORAGE_KEYS.KEY, (anonKey || '').trim());
        localStorage.setItem(STORAGE_KEYS.ENABLED, enabled ? 'true' : 'false');
        localStorage.setItem(STORAGE_KEYS.MODE, 'supabase');
        return this.initClient(url, anonKey);
      } catch (e) {
        console.error('Failed to save Supabase config to localStorage:', e);
        return false;
      }
    }

    clearConfig() {
      try {
        localStorage.removeItem(STORAGE_KEYS.URL);
        localStorage.removeItem(STORAGE_KEYS.KEY);
        localStorage.setItem(STORAGE_KEYS.ENABLED, 'false');
        localStorage.setItem(STORAGE_KEYS.MODE, 'local');
        this.client = null;
        this.isConnected = false;
        this.connectionStatus = 'offline';
        this.notifyStatusChange();
        return true;
      } catch (e) {
        return false;
      }
    }

    initClient(url, anonKey) {
      if (!url || !anonKey) {
        this.client = null;
        this.isConnected = false;
        this.connectionStatus = 'offline';
        this.notifyStatusChange();
        return false;
      }

      if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.warn('[Supabase] Supabase JS SDK not loaded yet. Will retry after script loads.');
        this.connectionStatus = 'connecting';
        this.notifyStatusChange();
        return false;
      }

      try {
        this.client = window.supabase.createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        });

        this.connectionStatus = 'connecting';
        this.notifyStatusChange();

        // Async ping test
        this.testConnection();
        return true;
      } catch (err) {
        console.error('[Supabase] Initialization failed:', err);
        this.client = null;
        this.isConnected = false;
        this.connectionStatus = 'error';
        this.notifyStatusChange();
        return false;
      }
    }

    async testConnection(customUrl = null, customKey = null) {
      const startTime = performance.now();
      let testClient = this.client;

      if (customUrl && customKey) {
        if (typeof window.supabase === 'undefined') {
          return { success: false, error: 'Supabase JS library not loaded. Check internet connection.' };
        }
        try {
          testClient = window.supabase.createClient(customUrl, customKey);
        } catch (e) {
          return { success: false, error: e.message };
        }
      }

      if (!testClient) {
        return { success: false, error: 'No Supabase credentials configured.' };
      }

      try {
        // Query profiles or companies table with limit 1
        const { data, error } = await testClient
          .from('companies')
          .select('id, name')
          .limit(1);

        const latency = Math.round(performance.now() - startTime);

        if (error) {
          // If companies table doesn't exist yet, try profiles
          const { error: profErr } = await testClient.from('profiles').select('id').limit(1);
          if (profErr) {
            if (!customUrl) {
              this.isConnected = true;
              this.lastPing = latency;
              this.connectionStatus = 'needs_schema';
              this.notifyStatusChange();
            }
            return {
              success: false,
              needsSchema: true,
              latency,
              error: `Supabase project reachable! (Latency: ${latency}ms)\nHowever, database tables have not been created yet. Please copy supabase/schema.sql and run it in your Supabase SQL Editor.`
            };
          }
        }

        if (!customUrl) {
          this.isConnected = true;
          this.lastPing = latency;
          this.connectionStatus = 'connected';
          this.notifyStatusChange();
        }

        return {
          success: true,
          latency,
          message: `Connected successfully! (Latency: ${latency}ms)`
        };
      } catch (err) {
        if (!customUrl) {
          this.isConnected = false;
          this.connectionStatus = 'error';
          this.notifyStatusChange();
        }
        return {
          success: false,
          error: err.message || 'Unable to connect to Supabase project.'
        };
      }
    }

    async getTableStats() {
      if (!this.client) return null;
      try {
        const [p, c, a, q] = await Promise.all([
          this.client.from('profiles').select('id', { count: 'exact', head: true }),
          this.client.from('companies').select('id', { count: 'exact', head: true }),
          this.client.from('applications').select('id', { count: 'exact', head: true }),
          this.client.from('questions').select('id', { count: 'exact', head: true })
        ]);

        return {
          profiles: p.count || 0,
          companies: c.count || 0,
          applications: a.count || 0,
          questions: q.count || 0
        };
      } catch (e) {
        console.warn('[Supabase] Failed to fetch table stats:', e);
        return null;
      }
    }

    onStatusChange(fn) {
      if (typeof fn === 'function') {
        this.statusListeners.push(fn);
        fn(this.connectionStatus, this.isConnected, this.lastPing);
      }
    }

    notifyStatusChange() {
      this.statusListeners.forEach(fn => {
        try {
          fn(this.connectionStatus, this.isConnected, this.lastPing);
        } catch (e) {}
      });
    }

    getClient() {
      return this.client;
    }

    isReady() {
      return Boolean(this.client && this.isConnected && this.connectionStatus === 'connected');
    }
  }

  window.ptsSupabase = new SupabaseClientManager();
})();
