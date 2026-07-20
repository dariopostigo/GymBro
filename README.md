# GymBro

Template de React Native (CLI, TypeScript) para una app de gimnasio y fitness. Incluye una pantalla de bienvenida ("Hello World") con la identidad visual del proyecto, lista para empezar a construir funcionalidades como rutinas, seguimiento de progreso y estadísticas.

## Requisitos

- Node.js >= 22.11
- JDK 17 y [Android Studio](https://developer.android.com/studio) configurado (SDK + emulador o dispositivo físico con depuración USB)
- Solo en macOS, si además quieres compilar para iOS: Xcode y CocoaPods

## Empezar

Instala las dependencias:

```sh
npm install
```

Arranca Metro (bundler):

```sh
npm start
```

En otra terminal, compila y ejecuta en Android:

```sh
npm run android
```

Si tienes acceso a macOS, para iOS:

```sh
npm run ios
```

## Estructura

- [App.tsx](App.tsx) — pantalla principal con el Hello World temático de fitness
- [index.js](index.js) — punto de entrada de la app
- [android/](android) y [ios/](ios) — proyectos nativos generados por React Native CLI

## Próximos pasos sugeridos

- Navegación entre pantallas (React Navigation)
- Pantallas de rutinas, ejercicios y registro de series/repeticiones
- Persistencia local (AsyncStorage / SQLite) o backend propio
