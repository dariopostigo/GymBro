# GymBro — tareas pendientes

## Prioridad alta

- [x] **Temporizador de descanso** (desactivable en Ajustes)
  - Arranca solo al apuntar una serie.
  - Duración configurable (p. ej. 90 s por defecto).
  - Vibración al terminar.

- [x] **Sugerencia de sobrecarga progresiva** (incremento en Ajustes)
  Si en la última sesión se llegó a `targetRepsMax` en todas las series, proponer subir peso (p. ej. +2,5 kg) en vez de repetir lo de la última vez.

- [x] **Pantalla siempre encendida** mientras se está en la pestaña Hoy.

- [x] **Aviso de entreno sin terminar**: si se apuntaron series y no se pulsó "Terminar", al volver horas después pregunta si terminarlo y pasar al siguiente día o seguir con él.

- [x] **Copia de seguridad** en Ajustes: exportar a JSON ("Guardar como": Drive, Descargas...), importar reemplazando los datos y deshacer la última importación.

- [x] **Resumen al terminar**: series, volumen, comparación con la última vez del mismo día, récords (peso o 1RM estimado) y tendencia por ejercicio. Sale también al terminar desde el aviso de entreno sin terminar.

- [x] **Abrir el resumen de un entreno pasado** tocando una de las sesiones recientes en Progreso.

- [x] **Rutina PPL de hipertrofia** (Push A → Pull A → Legs A → Push B → Pull B → Legs B, para 3-4 días por semana; sin rumano ni abdominales). Sustituye al PPL anterior y queda como split activo con una migración única. El Torso / Pierna vuelve a ser el básico de 2 días.

- [x] **Descanso automático según el ejercicio**: sale del rango de reps (6-7 → 2:30, 8-9 → 2:00, 10-11 → 1:30, 12+ → 1:00), se puede fijar por ejercicio en el editor del día y desactivar en Ajustes.

- [x] **Los cambios en rutinas predefinidas ya no se pierden al reiniciar**: los días editados quedan como personalizados (con "Restaurar el día original" en el editor) y entran en la copia de seguridad.

- [x] **Aviso de récord** al apuntar una serie que supera la mejor marca del ejercicio: la fila sale con trofeo y lo que ha batido (mismo criterio que el resumen).

- [x] **Plan B por si la máquina está ocupada**: se elige por ejercicio en el editor del día y en Hoy se cambia con un toque (con las mismas series y reps) y se vuelve igual.

- [x] **Plan B por defecto en todos los ejercicios** (`src/data/exerciseBackups.ts`): se usa cuando el hueco no tiene uno elegido a mano. Un test obliga a que cada ejercicio nuevo del catálogo tenga el suyo.

- [x] **Corregir una serie ya apuntada** tocándola en Hoy (peso, reps y esfuerzo), sin reiniciar el descanso.

- [x] **Añadir un ejercicio solo para hoy** desde Hoy: sale al final marcado "Solo hoy", se puede quitar y desaparece al terminar el día.

- [x] **Repeticiones por lado** en 57 ejercicios a un lado (`src/data/unilateralExercises.ts`): se apuntan "por lado", el volumen cuenta los dos lados y una serie sigue siendo una serie para el músculo. Solo afecta a las series nuevas.

- [x] **Calculadora de discos** en Hoy para barra, barra Z, Smith y máquinas de discos ("Por lado: 25 · 5 · 1,25"); discos y peso de cada barra en Ajustes → Discos y barras.

- [x] **Pesos reales de cada máquina** (ficha del ejercicio → "Pesos de la máquina", por saltos fijos o lista a mano): la sugerencia sube al siguiente peso que existe y en Hoy el peso sube y baja por la pila con − / +. Entra en la copia de seguridad. Las máquinas de placas y las poleas traen pesos por defecto aproximados (`src/data/defaultWeightStacks.ts`) que se corrigen en la ficha.

- [x] **Esfuerzo RIR / RPE** opcional por serie (Ajustes → Progresión): botones al apuntar, etiqueta en Hoy y en el historial, y si en todas las series sobraban 3 o más reps se sugiere subir peso. Se guarda siempre como RIR.

- [x] **Series por grupo muscular a la semana** en Progreso: mapa de calor sobre la silueta y barras con la franja 10-20 y el cambio respecto a la semana pasada (1 serie por principal, 0,5 por secundario).

- [x] **Siluetas de MuscleMap** (MIT, `scripts/generate-body-paths.js` → `src/data/bodyPaths.ts`) en los iconos de categoría y **mapa corporal por sesión** en Inicio y en cada día de la rutina (principal / secundario).

- [x] **Ficha del ejercicio** en la pantalla del ejercicio (biblioteca y reloj de Hoy): cómo se hace, músculos, equipamiento y plan B, que abre su propia ficha.

- [x] Etiquetas de Inicio sin partirse y pesos con coma decimal en toda la app.

- [x] **Catálogo**: Brazos separado en Bíceps / Tríceps / Antebrazos y Piernas en Cuádriceps / Femoral / Glúteos; iconos de músculo en los chips de categoría; variantes de máquina de placas / de discos / polea; fusionado el curl martillo en polea duplicado.


## Muy útil


## Ideas sacadas de openGym

Solo ideas, reimplementadas: el código de openGym es AGPL y sus animaciones (Gym visual) no se pueden reutilizar. Las siluetas de MuscleMap sí (MIT).

Cerrada: las que interesaban están hechas (ver arriba). Descartadas a propósito: series de calentamiento, drop sets / rest-pause y superseries.

Segunda vuelta (30/10/2026, mirando su código): se hacen poco a poco, de una en una.

- [x] **Ejercicios con el peso del cuerpo** (dominadas, fondos, flexiones...): lista en `src/data/bodyweightExercises.ts`; el peso es el lastre ("Lastre (kg)", 0 vale), se muestra "Peso corporal" / "PC+10", sin lastre no se sugiere cargar (avisa al llegar al tope) y el récord son las reps.
- [x] **Detectar estancamiento y sugerir descarga**: tras 3 sesiones seguidas con el mismo peso sin llegar al tope ni hacer más reps en total que alguna anterior con ese peso, Hoy propone "Descarga: baja a X" (~90 %, al salto o peso de la pila más cercano, nunca más de un 20 %) y apunta al tope de reps. Sin lastre no hay descarga.
- [x] **Deshacer al borrar una serie**: al borrar sale "Serie borrada · 17,5 kg × 12 · Deshacer" durante 5 s, encima del descanso si está en marcha; deshacer la devuelve a su sitio con su id, número y hora.
- [x] **Editar entrenos pasados**: "Editar entreno" en el resumen abre una pantalla para corregir, añadir o borrar series, añadir o quitar ejercicios, cambiar el día de la rutina, mover la fecha (‹ ›, nunca al futuro) y borrar el entreno. En el calendario, tocar un día pasado sin entreno ofrece apuntar uno hecho sin la app (trae los ejercicios del día elegido; si se deja sin series no se guarda).
- [ ] **Ejercicios por tiempo** (plancha, colgarse, paseo del granjero): segundos en vez de reps.
- [ ] **Músculos sin entrenar** en Progreso ("Bíceps: 9 días sin entrenar"), versión simple.
- [ ] **Crear ejercicios propios desde la app**, con foto.
- [ ] Inicio no cuenta los ejercicios "solo hoy": dice 6 ejercicios / 23 series cuando Hoy dice 7 / 26.

## Pendientes (de momento no)

- [ ] **Notas** por ejercicio o por sesión (altura del asiento, molestias...).
- [ ] **Peso corporal** con gráfica. Va ligado a otra idea que está por concretar: esperar a tenerla.
- [x] **Duración del entreno** en el resumen y en las sesiones recientes: cada serie guarda su hora (`loggedAt`) y se cuenta de la primera a la última. Las sesiones antiguas no la muestran.

## Si apetece

- [x] **Calendario** con los días entrenados en Progreso: un color por día de la rutina (con leyenda), hoy marcado, tocar un día abre su resumen, flechas para los meses anteriores y total del mes con la media por semana.
- [x] Recordar qué tarjetas de Hoy se han plegado a mano (se guarda con los cambios "solo hoy": sobrevive al cierre de la app y a las listas largas; se olvida al terminar el día, al cambiar el ejercicio o al completarse/descompletarse).

## Diseño

- [x] **Revisión del diseño con capturas** (30/10/2026, en el emulador GymBro_API35 con datos de prueba). Arreglado: fila de la barra Smith que se salía, volumen partido en Inicio, barra del descanso tapando el final de las listas, avisos del sistema en blanco (ahora oscuros), subtítulos repetidos ("Pecho · Pecho"), nombres cortados a una línea, "Récords de hoy" en entrenos pasados, flecha ↓ junto a un récord (ahora trofeo), cambiar de día en Rutina sin avisar con un entreno a medias, flechas de orden invisibles en el editor, músculos principal y secundario repetidos y mayúsculas raras en tres nombres.
- [x] **Tarjetas de Hoy más compactas**: miniatura (se amplía al tocarla) con objetivo, hechas y última vez arriba; luego series y peso/reps; Plan B, cambiar ejercicio y series objetivo plegados al final.
- [x] Historial de ejercicio: texto de "Orden dentro del entrenamiento" en una línea y "2º del entreno" en vez de "Como #2".
- [x] Filtros por grupo sin los iconos, que apenas se veían: solo el nombre, y caben más a la vista.

## Mantenimiento

- [ ] **Cierre intermitente al arrancar, solo en la build de depuración (con Metro)**: SIGSEGV nativo en Fabric (`MountingCoordinator::pullTransaction`) ~0,5 s después de montar la pantalla principal, en ~1 de cada 3-5 arranques. La build release no falla (0 cierres en 8 arranques, 8/10). Si aparece en release, descartar keep-awake / fs / picker de uno en uno. **30/10/2026**: 0 cierres en 15 arranques en frío en el emulador (GymBro_API35, Android 15, con Metro); el Xiaomi no estaba conectado para repetir la prueba allí. El fallo está dentro de React Native (el hilo de JS salta a memoria liberada en `pullTransaction`, sin código de la app en la pila), así que no hay arreglo en el código de la app: repetir la prueba en el móvil y, si sigue, probar con la siguiente versión de React Native.
- [x] README actualizado: qué hace la app, cómo arrancarla, estructura y cómo se genera el catálogo.
- [x] Avisos de eslint (`exerciseSearch.ts` y el `eslint-disable` sobrante de `bodyPaths.ts`): `npm run lint` sale limpio.
- [x] Fotos compartidas revisadas: 10 duplicados fusionados (crunch, aperturas posteriores e inversas, curl femoral de pie, rotación externa tumbado, remo en V, aperturas en polea baja/alta, remo inclinado con apoyo), 3 fotos cambiadas por otras correctas y 2 quitadas por ser de otro ejercicio. El resto de fotos repetidas son variantes del mismo gesto y se dejan. *Jalón con agarre ancho* (723) fusionado después en *Jalón al pecho* (355), que se queda con su descripción y sus músculos secundarios.
- [x] Descripciones en inglés traducidas (saltos al cajón, press de banca supino con mancuernas, curl femoral) y arreglada la de la extensión de tríceps sobre la cabeza.
