# GymBro — Planning

> Documento vivo. Lo vamos afinando a medida que resolvemos las preguntas abiertas.
> Última actualización: 2026-09-04 (Fase 8 — rutina PPL de referencia verificada contra el catálogo)

## 0. Alcance

- App **exclusivamente personal** (un solo usuario, sin cuentas, sin backend multiusuario).
- Catálogo de ejercicios importado desde la API pública de **wger** (ver [Fase 1](#fase-1--catálogo-de-ejercicios)), guardado localmente para no depender de su disponibilidad.
- Todo el resto (rutinas, splits, historial) es lógica propia, local, sin relación con el modelo de rutinas de wger.

---

## 1. Selección de Split

- El usuario elige un **split** (ej. Push/Pull/Legs, Torso-Pierna, Bro Split, o uno personalizado con sus propios días).
- Al seleccionarlo, queda guardado como **split activo por defecto** — no se vuelve a preguntar cada semana, se mantiene hasta que el usuario lo cambie explícitamente.

**Decidido (v1):**
- El día de hoy se calcula por **secuencia de sesiones**, no por calendario: el split avanza al siguiente día cada vez que se **completa** un entrenamiento (se marca la sesión como terminada), sin importar qué día de la semana sea. Si un día faltas al gym, el ciclo simplemente te espera — no se salta ni se desincroniza.
- No hay días de descanso "definidos" en el split en sí; el descanso es implícito (no entrenas ese día, no avanza el ciclo). Se puede añadir más adelante un tipo de día especial "Descanso" dentro de un split si se echa en falta.

---

## 2. Día de entrenamiento (ej. "Push")

- Cada día del split tiene una **lista ordenada de ejercicios** (ej. Push: press banca → press militar → fondos → extensión tríceps...).
- Ese orden es el **por defecto**, pero el usuario puede:
  - Reordenar los ejercicios.
  - Sustituir un ejercicio por otro (del catálogo, filtrando por el mismo grupo muscular).

**Decidido (v1):**
- Se soportan **ambas** opciones: al sustituir un ejercicio se ofrece elegir entre "solo hoy" (afecta únicamente a la sesión actual, la plantilla del día no cambia) o "cambiar en la plantilla" (se actualiza `DayExerciseSlot` de forma permanente para las próximas semanas).

---

## 3. Ficha de ejercicio

Para cada ejercicio dentro del día se muestra:
- Nombre, grupo muscular (primario/secundario), equipo necesario.
- **Imagen o GIF** de ejecución correcta (viene del campo `images`/`video` de la API de wger).
- Series y repeticiones objetivo (configurables por ejercicio, con valor por defecto en la plantilla del día).

---

## 4. Registro e historial de peso — con contexto de posición

Requisito clave: **el peso que se levanta depende de en qué posición del día se hace el ejercicio**, por fatiga acumulada. Ejemplo: press banca con mancuernas — 30kg/mano si es el 1er ejercicio, ~25kg/mano si es el 3º.

Por tanto, cada serie registrada debe guardar, además de fecha/peso/reps:
- **Posición en la sesión** (1º, 2º, 3º ejercicio del día).
- Nº de serie dentro del ejercicio (serie 1, 2, 3...).

La vista de historial/progresión debe poder **segmentar por posición**, para comparar peso levantado en igualdad de condiciones (ej. "progresión de press banca como 1er ejercicio" separado de "como 3er ejercicio"), en vez de mezclarlo todo en una sola gráfica engañosa.

---

## 5. Modelo de datos (borrador)

```
Exercise                  (id, name, muscle_primary, muscle_secondary, equipment, image_url, gif_url, category)
                           ↳ importado 1 vez desde wger, ver Fase 1

Split                      (id, name, type)                     # "PPL", "Torso-Pierna", "Bro Split", custom...
SplitDay                   (id, split_id, name, order)           # "Push", "Pull", "Legs"
DayExerciseSlot            (id, day_id, exercise_id, order, target_sets, target_reps_min, target_reps_max)

ActiveSplit                (split_id, current_day_index / last_session_date)   # config única, sin re-preguntar cada semana

WorkoutSession             (id, date, split_day_id)
SetEntry                   (id, session_id, exercise_id, position_in_session, set_number, weight, reps)
```

`SetEntry.position_in_session` es la clave para el requisito del punto 4.

**Decisión de persistencia (v1)**: `Split`/`SplitDay`/`DayExerciseSlot`/`ActiveSplit` se guardan con **AsyncStorage** (blobs JSON), no SQLite. Dado que es una app de un solo usuario con un volumen de datos pequeño (unos pocos splits, pocas decenas de ejercicios por plantilla), no compensa la complejidad de enlazar una dependencia nativa de SQLite todavía. Se reevaluará en la Fase 5 (historial): si las consultas de progresión por posición se vuelven pesadas de filtrar en JS, se migra `WorkoutSession`/`SetEntry` a SQLite (ej. `react-native-sqlite-storage` o `expo-sqlite`) manteniendo `Split`/`ActiveSplit` en AsyncStorage.

---

## 6. Roadmap de implementación (fases)

### Fase 1 — Catálogo de ejercicios ✅ Hecho
- Script [`scripts/fetch-exercises.js`](../scripts/fetch-exercises.js) (`npm run fetch:exercises`): descarga `exerciseinfo` de wger, elige la traducción en español (con fallback a inglés), traduce categoría/músculo/equipo (vocabulario fijo, mapeado a mano) y guarda en [`src/data/exercises.json`](../src/data/exercises.json).
- Tipos en [`src/types/exercise.ts`](../src/types/exercise.ts).
- **Resultado**: 844 ejercicios guardados, 8 categorías (Pecho, Espalda, Piernas, Hombros, Brazos, Abdominales, Gemelos, Cardio).
- **Caveat detectado**: solo **264/844** ejercicios tienen imagen y **46/844** tienen vídeo (limitación de los datos comunitarios de wger, no del script). A tener en cuenta en Fase 2/3: puede que al montar el split personal convenga priorizar ejercicios con imagen/vídeo disponible, o aceptar que algunos se muestren solo con descripción de texto.

### Fase 2 — Splits y plantillas de día ✅ Hecho
- Presets reales en [`src/data/splitPresets.ts`](../src/data/splitPresets.ts): **PPL** (Push/Pull/Legs), **Torso/Pierna** y **Bro Split** (Pecho/Espalda/Piernas/Hombros/Brazos), con ejercicios reales del catálogo (priorizando los que tienen imagen).
- Persistencia en [`src/storage/routineStorage.ts`](../src/storage/routineStorage.ts) (AsyncStorage) + estado global en [`src/context/RoutineContext.tsx`](../src/context/RoutineContext.tsx).
- Pantallas:
  - [`SplitSelectionScreen`](../src/screens/SplitSelectionScreen.tsx) — elegir split (solo se muestra si no hay uno activo guardado) + opción de crear uno personalizado ([`CreateCustomSplitScreen`](../src/screens/CreateCustomSplitScreen.tsx)).
  - [`SplitOverviewScreen`](../src/screens/SplitOverviewScreen.tsx) — lista de días del split activo, marcando cuál "toca hoy" según `currentDayIndex`.
  - [`DayEditorScreen`](../src/screens/DayEditorScreen.tsx) — editor de la plantilla del día: reordenar ejercicios (▲▼), ajustar series/reps objetivo, quitar ejercicios, cambiar/añadir ejercicio.
  - [`ExercisePickerScreen`](../src/screens/ExercisePickerScreen.tsx) — buscador + filtro por grupo muscular sobre las 844 fichas del catálogo, para añadir o sustituir ejercicios en cualquier día.
- Navegación con `@react-navigation/native-stack`, tema oscuro consistente con la identidad visual original.
- **Nota**: el editor de día edita la **plantilla permanente**. El swap "solo por hoy" (sin tocar la plantilla) es una decisión que corresponde a la Fase 3 (pantalla de sesión en vivo), no a este editor.

### Fase 3 — Pantalla de "día de hoy" ✅ Hecho
- [`TodayScreen`](../src/screens/TodayScreen.tsx): ahora es la **pantalla de aterrizaje** cuando hay un split activo (antes lo era `SplitOverview`, que pasa a ser secundaria — accesible desde "Ver todos los días / cambiar split").
- Muestra el día que toca (`currentDay`, calculado por `currentDayIndex % días.length` en `RoutineContext`), con sus ejercicios en orden, cada uno con: imagen (si el ejercicio del catálogo tiene), nombre, grupo muscular, series/reps objetivo y descripción.
- **Sustitución de ejercicio con las dos opciones decididas en el punto 2**:
  - *"Cambiar solo hoy"* → `ExercisePickerScreen` en modo `today`; el resultado se guarda en un `overrides` de estado local (no toca `AsyncStorage`/la plantilla) y se resetea automáticamente en cuanto cambia el día actual.
  - *"Cambiar en plantilla"* → reutiliza el modo `replace` ya existente de la Fase 2, que sí persiste en `DayExerciseSlot`.
- **"Terminar entrenamiento"**: llama a `advanceToNextDay()`, que incrementa `currentDayIndex` en `ActiveSplit` (persistido) — así el split avanza por **secuencia de sesiones**, tal y como se decidió en el punto 1.

### Fase 4 — Registro de series ✅ Hecho
- [`SessionContext`](../src/context/SessionContext.tsx) + [`sessionStorage`](../src/storage/sessionStorage.ts) (AsyncStorage): modelo `WorkoutSession`/`SetEntry` tal cual el borrador del punto 5.
- En cada tarjeta de ejercicio de `TodayScreen` hay un input rápido de peso/reps con botón "+ Serie". `addSet()` calcula solo:
  - `positionInSession` = posición del ejercicio en la lista de hoy (1º, 2º, 3º...), **automáticamente**, a partir del índice en la sesión actual — no lo introduce el usuario.
  - `setNumber` = nº de serie dentro de ese ejercicio en la sesión de hoy.
- Si no existe todavía una sesión abierta para el split+día de hoy, se crea sola al añadir la primera serie (no hace falta un botón "empezar entrenamiento" explícito).
- Sugerencia de peso/reps: al abrir cada tarjeta, se prellena con el último valor registrado **para ese mismo ejercicio en esa misma posición** (`getLastEntryForPosition`) — ya aplica la lógica de "no es lo mismo de 1º que de 3º" incluso antes de mirar el historial completo.
- Se puede seguir entrenando el mismo día aunque cierres la app a medias (la sesión sigue "abierta" hasta pulsar "Terminar entrenamiento").

### Fase 5 — Historial y progresión ✅ Hecho
- [`ExerciseHistoryScreen`](../src/screens/ExerciseHistoryScreen.tsx), accesible desde "Ver historial de este ejercicio" en cada tarjeta de `TodayScreen`.
- **Segmentado por posición**: chips "Como #1", "Como #2"... (solo aparecen las posiciones en las que ese ejercicio se ha hecho realmente alguna vez). Cambiar de chip cambia tanto la gráfica como la tabla — así se compara peso máximo de "press banca como 1er ejercicio" vs. "como 3º" sin mezclarlos, exactamente el requisito original.
- Gráfica de barras (peso máximo por sesión, para la posición seleccionada) construida con `View` planas (sin librería de gráficos nativa, para no añadir dependencias nativas extra en un entorno donde no puedo probar en emulador). Un único color de acento (sin necesidad de leyenda, al ser una sola serie), etiquetas de valor directas y eje de fechas en tinta apagada.
- Tabla detallada debajo, agrupada por fecha de sesión, con serie/peso/reps — sirve también como vista accesible sin depender de la gráfica.
- La reordenación posterior de ejercicios en la plantilla **no reescribe el historial**: `positionInSession` se graba en el momento de cada serie, así que refleja lo que realmente pasó ese día.

### Fase 6 — Menú principal y rediseño visual ✅ Hecho
- **Navegación**: nuevo `@react-navigation/bottom-tabs` en [`MainTabs`](../src/navigation/MainTabs.tsx) con cuatro pestañas — **Inicio**, **Hoy**, **Rutina** y **Progreso** — dentro de la ruta `Main` del stack. El stack se queda solo con las pantallas modales/secundarias (selección de split, creación de split, editor de día, picker e historial). Barra de pestañas propia ([`MainTabBar`](../src/components/MainTabBar.tsx)): flotante, redondeada, con la pestaña activa como píldora amarilla con etiqueta.
- **`HomeScreen` (nuevo)**: pantalla de aterrizaje y menú principal — saludo + racha, tarjeta destacada del entrenamiento de hoy con progreso de series y CTA "Empezar/Continuar entrenamiento", cuatro métricas (sesiones, series, volumen, racha), gráfica de volumen de los últimos 7 días y lista de accesos: entrenar hoy, mi rutina, progreso, editar el día de hoy y cambiar de split.
- **`ProgressScreen` (nuevo)**: métricas globales, volumen semanal, sesiones recientes y lista de ejercicios entrenados (con récord de peso) que enlaza con `ExerciseHistoryScreen`. Cálculos en [`src/utils/stats.ts`](../src/utils/stats.ts).
- **Identidad visual** (referencia: mockup de app fitness con negro + amarillo): paleta nueva en [`src/theme/colors.ts`](../src/theme/colors.ts) (fondo casi negro `#0d0e10`, superficies grises, acento amarillo `#f2d024`, texto negro sobre acento) y tokens de radio/espaciado/sombra en [`src/theme/index.ts`](../src/theme/index.ts). Primitivas compartidas en [`src/components/ui.tsx`](../src/components/ui.tsx) (`Card`, `PrimaryButton`, `GhostButton`, `Chip`, `StatTile`, `ProgressBar`, `ScreenHeader`, `EmptyState`) y iconos dibujados con `View` en [`src/components/icons.tsx`](../src/components/icons.tsx) — **cero dependencias nativas nuevas**, solo el paquete JS de tabs.
- Todas las pantallas anteriores se han rehecho con ese sistema (cabeceras propias en las pestañas, píldoras, tarjetas con borde, botones amarillos redondeados).
- **Tests**: [`__tests__/MainMenu.test.tsx`](../__tests__/MainMenu.test.tsx) monta la app con un split activo y comprueba que entra en el menú principal. De paso se arreglaron los mocks de Jest (`AsyncStorage` v3 y `react-native-safe-area-context`): sin ellos el `SafeAreaProvider` no pintaba hijos y `App.test.tsx` pasaba renderizando un árbol vacío.

### Fase 7 — Correcciones de UX ✅ Hecho
- **Semana de lunes a domingo**: `volumeByDay` pasa a ser [`volumeByWeek`](../src/utils/stats.ts) y muestra la **semana en curso** (L → D) en vez de los últimos 7 días rodantes; los días aún por venir se pintan atenuados (`isFuture`). Cubierto por [`__tests__/stats.test.ts`](../__tests__/stats.test.ts).
- **Inputs por encima del teclado**: hook [`useKeyboardInset`](../src/hooks/useKeyboardInset.ts) que mide el solape real entre el teclado y el contenedor (`measureInWindow` contra `endCoordinates.screenY`). Al medir el solape en vez de asumir la altura del teclado, funciona igual si la ventana se redimensiona (`adjustResize`) que si el teclado se dibuja encima (iOS / edge-to-edge): en el primer caso el solape sale 0 y no se añade relleno de más. En `TodayScreen` el `onFocus` de peso/reps además desplaza la tarjeta con `scrollToIndex({ viewPosition: 1, viewOffset: -inset })`.
- **Barra de pestañas animada** ([`MainTabBar`](../src/components/MainTabBar.tsx)): entra deslizándose al montar, la pastilla activa crece (`flexGrow`) mientras cruza el color de fondo y los iconos, el icono da un pequeño salto al activarse y la barra se esconde cuando sale el teclado (así no tapa el input).
- **Transiciones de pantalla**: stack con `slide_from_right`; "Elegir ejercicio" y "Nuevo split" entran como **modal** desde abajo; las pestañas usan `animation: 'shift'`. Entrada escalonada del contenido con [`FadeInView`](../src/components/FadeInView.tsx) (Inicio, Hoy, Rutina, Progreso, editor de día) y fundido de cada serie nueva registrada.
- **Filtro precargado al cambiar de ejercicio**: `ExercisePicker` acepta `currentExerciseId` y arranca con el chip de la categoría del ejercicio que se está sustituyendo (si es de pecho, entra filtrado por pecho) además de desplazar la lista de chips hasta él.
- Las animaciones de Jest se sustituyen por `AnimatedMock` de RN (`react-test-renderer` no resuelve el driver nativo y reventaba al terminar los tests).
- **Acceso al historial**: en la tarjeta de ejercicio de "Hoy" queda un solo acceso (el botón redondo de la cabecera, ahora con un icono de reloj `HistoryIcon` en vez de la flecha); se quitó el enlace de texto duplicado del pie.

### Fase 8 — Rutina PPL de referencia ✅ Hecho
- Se contrastó el preset PPL con la hoja de entrenamiento original (Push/Pull/Legs 1 y 2): coincide ejercicio a ejercicio y serie a serie. Dos ids apuntaban a un movimiento distinto del que decía el comentario y se han corregido en [`splitPresets.ts`](../src/data/splitPresets.ts):
  - "Abdominales declinados": `1889` (elevación de piernas en banco declinado) → **`427` Crunches negativos**, que es el crunch en banco declinado y además tiene fotos.
  - "Jalón unilateral": `1795` (jalón cruzado en polea, catalogado en *Hombros* y con el deltoides como músculo principal) → **`1972` Jalón al pecho a un brazo** (*Espalda*, dorsales).
- [`__tests__/pplPreset.test.ts`](../__tests__/pplPreset.test.ts) fija la rutina como contrato: nombres reales del catálogo y esquema `NxMin-Max` día por día, más una comprobación de que ningún preset apunta a un id inexistente.
- Los 6 ejercicios del PPL sin foto en el catálogo de wger (Jalón al pecho, Sentadillas Hack, Hip thrust con barra, T-Bar row, Jalón al pecho a un brazo y Pájaro de pie) se completaron a mano en [`exercises.json`](../src/data/exercises.json) con imágenes de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público, licencia Unlicense), servidas vía jsDelivr (`cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/...`) igual que las de wger ya son URLs remotas.
- ⚠️ Pendiente conocido: [`loadSplits`](../src/storage/routineStorage.ts) reescribe los presets desde el código en cada arranque, así que los cambios que el usuario haga sobre un split de preset (editor de día) se pierden al reiniciar la app.

---

## 7. Decisiones tomadas (resumen)

1. Avance del split: **secuencia de sesiones** (no calendario fijo).
2. Días de descanso: **implícitos**, no hay tipo de día especial en v1.
3. Sustitución de ejercicio: **ambas opciones** — solo hoy o permanente en la plantilla.

## 8. Estado de implementación

- [x] Fase 1 — Catálogo de ejercicios (844 ejercicios descargados a `src/data/exercises.json`)
- [x] Fase 2 — Splits y plantillas de día (presets PPL/Torso-Pierna/Bro Split, persistencia AsyncStorage, pantallas de selección/overview/editor/picker)
- [x] Fase 3 — Pantalla de "día de hoy" (TodayScreen como landing, swap solo-hoy vs. plantilla, avance de split por sesión)
- [x] Fase 4 — Registro de series (SessionContext + AsyncStorage, posición y nº de serie automáticos, sugerencia por posición)
- [x] Fase 5 — Historial y progresión (ExerciseHistoryScreen, segmentado por posición, gráfica + tabla)
- [x] Fase 6 — Menú principal navegable (tabs Inicio/Hoy/Rutina/Progreso) y rediseño visual negro + amarillo
- [x] Fase 7 — Correcciones de UX (semana L→D, inputs sobre el teclado, animaciones de barra y transiciones, filtro precargado al cambiar ejercicio)
- [x] Fase 8 — Rutina PPL de referencia verificada contra el catálogo y fijada con tests

**Proyecto v1 completo**: las 5 fases del roadmap original están implementadas. Pendiente de tu parte: instalar/correr en un emulador o dispositivo real (este entorno no tiene uno conectado) y probar el flujo de principio a fin para afinar cualquier detalle de UX.
