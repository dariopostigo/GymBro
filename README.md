# GymBro

App de gimnasio para uso personal, en español y sin conexión: rutinas por días, registro de series en el gimnasio y seguimiento del progreso. React Native (CLI, TypeScript), solo Android en la práctica.

## Qué hace

- **Rutinas**: plantillas predefinidas (Push / Pull / Legs, Torso / Pierna, Bro Split) o propias, editables día a día. Cada ejercicio tiene series, rango de repeticiones, descanso y un plan B.
- **Hoy**: el día que toca, con la sugerencia de peso de la última vez (sube cuando se llega al tope de reps o el RIR dice que sobró). Desde aquí se apuntan series (con RIR/RPE opcional), se corrigen las ya apuntadas, se cambia un ejercicio solo para hoy o al plan B y se añaden ejercicios extra. Además:
  - Temporizador de descanso automático.
  - Calculadora de discos por lado.
  - Ejercicios con el peso del cuerpo (se apunta el lastre) y por tiempo (segundos, con cronómetro).
  - Pesos reales de cada máquina.
  - Aviso de récord al momento.
- **Resumen al terminar**: volumen, comparación con la vez anterior, récords y mapa corporal de lo trabajado.
- **Progreso**: series semanales por grupo muscular (con la banda de 10-20), calendario de los días entrenados, historial y gráfica por ejercicio, sesiones pasadas con su duración.
- **Catálogo de ~450 ejercicios** con fotos, descripción, músculos y búsqueda por grupo (bíceps, tríceps, cuádriceps, femoral...), y ejercicios propios creados en la app con su foto.
- **Copia de seguridad** a JSON (exportar, importar y deshacer la importación).

Todo se guarda en el móvil con AsyncStorage; no hay cuentas ni servidor.

## Requisitos

- Node.js >= 22.11
- JDK 17 y [Android Studio](https://developer.android.com/studio) configurado (SDK + emulador o móvil con depuración USB). `npm run android` usa el JDK 17 de `/usr/lib/jvm` si lo encuentra, porque Gradle falla con JDKs muy nuevos.
- Solo en macOS, si además quieres compilar para iOS: Xcode y CocoaPods

Gradle usa el SDK de `android/local.properties` (`sdk.dir=...`, no se sube a git) o, si no existe, `ANDROID_HOME`. `npm run android` también lo usa para adb y el emulador aunque el sistema fije otro `ANDROID_HOME` (Manjaro pone `/opt/android-sdk`), y compila solo la arquitectura del dispositivo conectado. Comprueba que apunta a un SDK con el NDK `27.1.12297006` (o sus licencias aceptadas, para que Gradle lo descargue).

Las imágenes de `src/assets/exercises-local/` no están en git (copyright). Si faltan, la app usa las imágenes remotas del catálogo.

## Empezar

```sh
npm install
npm start          # Metro, en una terminal
npm run android    # compila e instala, en otra
```

`npm test` pasa los tests (Jest) y `npm run lint`, eslint. Para formatear: `npx prettier --write <ficheros>` (el ancho de 100 columnas lo fija `.prettierrc.js`).

## Estructura

- [src/screens/](src/screens): una pantalla por fichero (Hoy, Rutina, Progreso, Ajustes, editor del día, buscador de ejercicios...).
- [src/context/](src/context): el estado de la app (rutinas y cambios "solo hoy", sesiones, ajustes, temporizador, pesos de máquinas, favoritos).
- [src/storage/](src/storage): lectura y escritura en AsyncStorage, migraciones y copia de seguridad.
- [src/utils/](src/utils): lógica sin interfaz: progresión, récords, discos, series por músculo, búsqueda...
- [src/data/](src/data): catálogo de ejercicios y datos editables a mano:
  - [exercises.json](src/data/exercises.json): el catálogo. Se genera con los scripts y no se edita a mano.
  - [exerciseMerges.json](src/data/exerciseMerges.json): duplicados fusionados (id que sobra → id que se queda). Lo guardado con el id viejo se redirige solo.
  - [exerciseBackups.ts](src/data/exerciseBackups.ts): plan B por defecto de cada ejercicio.
  - [defaultWeightStacks.ts](src/data/defaultWeightStacks.ts): pesos aproximados de cada máquina.
  - [unilateralExercises.ts](src/data/unilateralExercises.ts): ejercicios a un lado (reps por lado).
  - [splitPresets.ts](src/data/splitPresets.ts): rutinas predefinidas.
- [scripts/](scripts): generación del catálogo y utilidades.
- [\_\_tests\_\_/](__tests__): tests. Varios obligan a que los datos a mano cubran todo el catálogo (por ejemplo, que cada ejercicio tenga plan B).

## Catálogo de ejercicios

El catálogo sale de [wger](https://wger.de) y se corrige con ficheros en `scripts/` que sobreviven a una nueva descarga:

| Fichero | Qué corrige |
| --- | --- |
| `exerciseNamesEs.js` | Nombres en español |
| `exerciseDescriptionsEs.js` | Descripciones reescritas |
| `exerciseFixes.js` | Categorías y músculos |
| `customExercises.js` | Ejercicios propios (ids 90001+) |
| `exerciseImagesFree.js` | Fotos de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) y los ejercicios sin equivalente |

Para aplicar los cambios sin volver a descargar de wger:

```sh
npm run fix:exercise-catalog   # duplicados, categorías, músculos y descripciones
npm run fix:custom-exercises   # ejercicios propios
npm run fix:exercise-names     # nombres
npm run fix:exercise-images    # fotos
```

`npm run fetch:exercises` lo descarga todo de nuevo y aplica lo anterior.

Las siluetas del cuerpo ([bodyPaths.ts](src/data/bodyPaths.ts)) vienen de [MuscleMap](https://github.com/melihcolpan/MuscleMap) (MIT) y se regeneran con `scripts/generate-body-paths.js`. El icono se genera con `npm run generate:icon`.

## Pendientes

En [notes.md](notes.md).
