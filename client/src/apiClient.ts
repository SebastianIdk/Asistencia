import { Capacitor, CapacitorHttp } from '@capacitor/core';

type Val = string | number | boolean | null | undefined;

function toStringParams(p?: Record<string, Val>) {
  const out: Record<string, string> = {};
  if (!p) return out;
  for (const [k, v] of Object.entries(p)) if (v != null) out[k] = String(v);
  return out;
}
function ensureAbsolute(url: string) {
  if (!url) throw new Error('API URL vacía');
  if (!/^https?:\/\//i.test(url)) throw new Error(`API URL no absoluta: ${url}`);
}

export async function apiGet<T = unknown>(url: string, params?: Record<string, Val>) {
  if (Capacitor.isNativePlatform()) {
    ensureAbsolute(url);
    const res = await CapacitorHttp.get({ url, params: toStringParams(params), headers: { Accept: 'application/json' } });
    if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
    return res.data as T;
  }
  const qs = params ? `?${new URLSearchParams(toStringParams(params))}` : '';
  const r = await fetch(url + qs, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('Error de red');
  return (await r.json()) as T;
}

export async function apiPost<T = unknown>(url: string, data: unknown) {
  if (Capacitor.isNativePlatform()) {
    ensureAbsolute(url);
    const res = await CapacitorHttp.post({
      url,
      data: data ?? {},
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
    return res.data as T;
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data ?? {}),
  });
  if (!r.ok) throw new Error('Error de red');
  return (await r.json()) as T;
}