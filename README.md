# Despliegue de App Ionic en Android 📱

Este README resume los pasos para armar, sincronizar y probar el proyecto Ionic usando Capacitor y Android Studio, sin necesidad de cables USB.
## ⚠️ Nota importante

- La versión web es funcional en el commit `v1`, debido a que en commits posteriores (por ejemplo, `end`) se realizaron cambios en el manejo de las solicitudes HTTP para compilar el APK.
- Si se desea probar la versión web (modo `ionic serve`), restaura los archivos correspondientes al commit `v1`.
- Si únicamente se desea compilar y utilizar el APK, puedes trabajar desde cualquiera de los commits más recientes.

---

## 📋 Requisitos

* Node.js y npm
* Ionic CLI (instalarlo con `npm install -g @ionic/cli`)
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

## 🌐 Ejecutar la versión Web

Desde el directorio `client/`, ejecuta los siguientes pasos:

```bash
npm install
```

Luego, para iniciar el servidor de desarrollo:

```bash
ionic serve
```

> ⚠️ **Nota:** Asegurarse de tener instalada la CLI de Ionic globalmente:
>
> ```bash
> npm install -g @ionic/cli
> ```

Esto abrirá la aplicación en el navegador en modo desarrollo, permitiendo ver los cambios en tiempo real.

---

## 1. Preparar el proyecto

```bash
# Desde la raíz client/
npm install
```

---

## 2. Configurar Capacitor

1. Editar `capacitor.config.json` para apuntar al directorio donde se genera la build web.
   Si Ionic crea `build/`, dejarlo así:

   ```jsonc
   {
     "appId": "com.tu.dominio.miapp",
     "appName": "MiApp",
     "webDir": "build",
     "bundledWebRuntime": false
   }
   ```

   > Si se usa otra carpeta (`www`, `dist`, etc.), se debe de cambiar en `webDir`.

2. Instalar la plataforma Android de Capacitor:

   ```bash
   npm install @capacitor/android --save
   ```

---

## 3. Generar los assets web

```bash
ionic build
# o
npm run build
```

---

## 4. Sincronizar con Android

```bash
npx cap sync android
```

Este comando:

* Copia la build web a `android/app/src/main/assets/public`
* Regenera archivos nativos faltantes (incluye `capacitor.settings.gradle`)

---

## 5. Abrir en Android Studio

```bash
npx cap open android
```

1. En Android Studio, dar un click en **“Sync Project with Gradle Files”**.
2. Esperá a que termine la sincronización.
3. Probar la aplicación en Android Studio y sacar el APK.

