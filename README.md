# README: Despliegue de tu App Ionic en Android 📱

Este README resume los pasos para armar, sincronizar y probar el proyecto Ionic usando Capacitor y Android Studio, sin necesidad de cables USB.
## Nota Importante
La versión Web es funcional en el commit 'v1', esto debido a que se hizo cambios en la forma de manejar http para el APK (Commit 'end')
Si se desea probar la versión Web (ionic) restaurar los archivos del commit 'v1', pero si solo se desea ocupar el APK, ocupar cualquiera de los ultimos commits.
---

## 📋 Requisitos

* Node.js y npm
* Ionic CLI (instálalo con `npm install -g @ionic/cli`)
* Android Studio con SDK de Android y **`adb`** en tu PATH
* En tu `package.json`, tener estas dependencias instaladas localmente:

  ```jsonc
  "dependencies": {
    "@capacitor/core": "X.X.X",
    …
  },
  "devDependencies": {
    "@capacitor/cli": "X.X.X",
    …
  }
  ```

---

## 1. Preparar el proyecto

```bash
# Desde la raíz de tu carpeta client/
npm install
```

---

## 2. Configurar Capacitor

1. Edita `capacitor.config.json` para apuntar al directorio donde se genera tu build web.
   Si Ionic crea `build/`, dejalo así:

   ```jsonc
   {
     "appId": "com.tu.dominio.miapp",
     "appName": "MiApp",
     "webDir": "build",
     "bundledWebRuntime": false
   }
   ```

   > Si usás otra carpeta (`www`, `dist`, etc.), cambiala en `webDir`.

2. Instala la plataforma Android de Capacitor:

   ```bash
   npm install @capacitor/android --save
   ```

---

## 3. Generar los assets web

```bash
# Genera build/ con index.html y assets
ionic build
# o
npm run build
```

Verificá que exista `client/build/index.html`.

---

## 4. Sincronizar con Android

```bash
npx cap sync android
```

Este comando:

* Copia tu build web a `android/app/src/main/assets/public`
* Regenera archivos nativos faltantes (incluye `capacitor.settings.gradle`)

---

## 5. Abrir en Android Studio

```bash
npx cap open android
```

1. En Android Studio, hacé click en **“Sync Project with Gradle Files”**.
2. Esperá a que termine la sincronización.

