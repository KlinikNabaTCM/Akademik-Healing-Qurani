import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Storage keys for in-app configuration fallback
export const STORAGE_KEY_SUPABASE_URL = 'ahq_custom_supabase_url';
export const STORAGE_KEY_SUPABASE_KEY = 'ahq_custom_supabase_key';

// Event for reactive updates across components
export const SUPABASE_CONFIG_CHANGED_EVENT = 'ahq_supabase_config_changed';

/**
 * Get active Supabase configuration from localStorage or Vite environment variables.
 */
export const getActiveSupabaseConfig = (): {
  url: string;
  anonKey: string;
  source: 'localStorage' | 'env' | 'none';
} => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL)?.trim();
    const customKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY)?.trim();

    if (customUrl && customKey && isValidUrl(customUrl)) {
      return {
        url: customUrl,
        anonKey: customKey,
        source: 'localStorage'
      };
    }
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();

  if (
    envUrl &&
    envKey &&
    envUrl !== 'https://your-project.supabase.co' &&
    envKey !== 'your-anon-key-here' &&
    isValidUrl(envUrl)
  ) {
    return {
      url: envUrl,
      anonKey: envKey,
      source: 'env'
    };
  }

  return {
    url: '',
    anonKey: '',
    source: 'none'
  };
};

function isValidUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const config = getActiveSupabaseConfig();
  return config.source !== 'none' && !!config.url && !!config.anonKey;
};

// Singleton dynamic client
let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const config = getActiveSupabaseConfig();

  if (config.source !== 'none') {
    if (!clientInstance) {
      clientInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return clientInstance;
  }

  // Fallback safe client for offline / mock usage
  return createClient('https://mock-ahq.supabase.co', 'mock-anon-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

// Export proxy instance that delegates dynamically to the active client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const active = getSupabaseClient();
    const value = (active as any)[prop];
    if (typeof value === 'function') {
      return value.bind(active);
    }
    return value;
  }
});

export interface DatabaseStatus {
  isConfigured: boolean;
  url: string | null;
  mode: 'supabase_cloud' | 'local_persistent';
  source: 'localStorage' | 'env' | 'none';
}

export const getDatabaseStatus = (): DatabaseStatus => {
  const config = getActiveSupabaseConfig();
  const configured = config.source !== 'none';
  return {
    isConfigured: configured,
    url: configured ? config.url : null,
    mode: configured ? 'supabase_cloud' : 'local_persistent',
    source: config.source
  };
};

/**
 * Test connectivity with given or active Supabase credentials
 */
export const testSupabaseConnection = async (
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string; latencyMs?: number; error?: string }> => {
  const config = getActiveSupabaseConfig();
  const url = (testUrl || config.url || '').trim().replace(/\/$/, '');
  const key = (testKey || config.anonKey || '').trim();

  if (!url || !key) {
    return {
      success: false,
      message: 'URL atau Anon Key Supabase belum diisi lengkap.'
    };
  }

  if (!isValidUrl(url)) {
    return {
      success: false,
      message: 'Format URL Supabase tidak valid. Gunakan format https://xxx.supabase.co'
    };
  }

  const startTime = Date.now();
  try {
    // Quick test against Supabase REST endpoint
    const response = await fetch(`${url}/rest/v1/?apikey=${key}`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    const latencyMs = Date.now() - startTime;

    // Supabase REST endpoint root typically returns status 200 with OpenAPI specs or 404/200 for schema
    if (response.status === 200 || response.status === 404 || response.status === 401) {
      if (response.status === 401) {
        return {
          success: false,
          latencyMs,
          message: 'Gagal Autentikasi: Anon Key tidak valid untuk project ini. Periksa kembali anon public key Anda.'
        };
      }
      return {
        success: true,
        latencyMs,
        message: `Koneksi berhasil! Terhubung ke server Supabase dalam ${latencyMs} ms.`
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Terhubung ke server Supabase (HTTP ${response.status}) dalam ${latencyMs} ms.`
    };
  } catch (err: any) {
    // Network or CORS error
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: `Gagal menjangkau server Supabase (${err?.message || 'Network Error'}). Pastikan koneksi internet aktif dan URL benar.`
    };
  }
};

/**
 * Save user-provided Supabase credentials to localStorage and re-initialize client
 */
export const saveCustomSupabaseConfig = async (
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  const cleanUrl = url.trim().replace(/\/$/, '');
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    return {
      success: false,
      message: 'Harap isi URL dan Anon Key secara lengkap.'
    };
  }

  if (!isValidUrl(cleanUrl)) {
    return {
      success: false,
      message: 'Format URL tidak valid. Contoh yang benar: https://abcdefghijklm.supabase.co'
    };
  }

  // Test before saving
  const testResult = await testSupabaseConnection(cleanUrl, cleanKey);
  if (!testResult.success) {
    return testResult;
  }

  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, cleanKey);

    // Reset client instance so subsequent calls instantiate with the new config
    clientInstance = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    // Notify listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SUPABASE_CONFIG_CHANGED_EVENT, { detail: { url: cleanUrl } }));
    }

    return {
      success: true,
      latencyMs: testResult.latencyMs,
      message: `Kredensial Supabase berhasil disimpan dan diterapkan! (${testResult.latencyMs} ms)`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menyimpan konfigurasi ke browser: ${err?.message || 'Unknown error'}`
    };
  }
};

/**
 * Clear custom Supabase credentials from localStorage
 */
export const clearCustomSupabaseConfig = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
    clientInstance = null;
    window.dispatchEvent(new CustomEvent(SUPABASE_CONFIG_CHANGED_EVENT, { detail: { cleared: true } }));
  }
};
