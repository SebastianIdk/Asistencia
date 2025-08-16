import { Capacitor } from '@capacitor/core';
const WEB_BASE = process.env.REACT_APP_API_BASE ?? '/api-puce';
const NATIVE_BASE = process.env.REACT_APP_API_BASE_PROD ?? 'https://puce.estudioika.com';
export const API_BASE = Capacitor.isNativePlatform() ? NATIVE_BASE : WEB_BASE;
export const API_EXAMEN = `${API_BASE}/api/examen.php`;