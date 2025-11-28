const DEFAULT_API_BASE = '/api';

export interface ApiRequestOptions extends RequestInit {
  json?: unknown;
}

export interface ApiClientConfig {
  baseUrl?: string;
  csrfCookieName?: string;
}

function getCookie(name: string) {
  if (!name || typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
}

function normalizeBase(url?: string) {
  if (!url) return DEFAULT_API_BASE;
  let value = url.trim();
  if (value.endsWith('/')) value = value.replace(/\/+$/, '');
  return value || DEFAULT_API_BASE;
}

export class ApiClient {
  private baseUrl: string;
  private csrfCookieName: string;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = normalizeBase(config.baseUrl);
    this.csrfCookieName = config.csrfCookieName || 'csrftoken';
  }

  setBaseUrl(url?: string) {
    this.baseUrl = normalizeBase(url);
  }

  private buildUrl(path: string) {
    if (!path) return this.baseUrl;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const trimmed = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${trimmed}`;
  }

  async request<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { json, headers = {}, method = 'GET', ...rest } = options;
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };
    const init: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
      ...rest,
    };
    if (json !== undefined) {
      init.body = typeof json === 'string' ? json : JSON.stringify(json);
      if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }
    }

    const upper = String(method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(upper) && !requestHeaders['X-CSRFToken']) {
      const token = getCookie(this.csrfCookieName);
      if (token) {
        requestHeaders['X-CSRFToken'] = token;
      }
    }

    const response = await fetch(this.buildUrl(path), init);
    const contentType = response.headers.get('Content-Type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await response.json() : await response.text();
    if (!response.ok) {
      const error = new Error(`API ${response.status}`);
      (error as any).status = response.status;
      (error as any).body = body;
      throw error;
    }
    return body as T;
  }
}

export const apiClient = new ApiClient();
