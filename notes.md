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

## Muy útil

- [ ] **Aviso de récord** al apuntar una serie que supera la mejor marca del ejercicio (el cálculo ya existe en el historial).
- [ ] **Series por grupo muscular a la semana** en Progreso, para ver qué músculos se quedan cortos.
- [ ] **Ficha del ejercicio** con descripción, músculos principales y secundarios y fotos (las descripciones en español ya están en el catálogo pero no se muestran).
- [ ] **Añadir un ejercicio solo para hoy** desde la pestaña Hoy (ahora solo se puede cambiar uno por otro).

## Pendientes (de momento no)

- [ ] **Editar una serie ya apuntada** (ahora solo se puede borrar).
- [ ] **Notas** por ejercicio o por sesión (altura del asiento, molestias...).
- [ ] **Duración del entreno** en el resumen y el historial (requiere guardar la hora de cada serie).

## Si apetece

- [ ] Registro de peso corporal con gráfica.
- [ ] Calendario con los días entrenados.
- [ ] Calculadora de discos (qué discos poner para un peso dado).
- [ ] Series de calentamiento sugeridas.
- [ ] Recordar qué tarjetas de Hoy se han plegado a mano (ahora se olvida al salir de la app o en listas largas).

## Diseño

- [ ] En Inicio, las etiquetas de las cifras se parten a mitad de palabra ("SESIONE / S", "VOLUME / N").
- [ ] **Revisión del diseño con capturas** de cada pantalla (por adb con el móvil conectado): espacios, jerarquía, legibilidad durante el entreno y tamaño de los botones.

## Mantenimiento

- [ ] **Cierre intermitente al arrancar, solo en la build de depuración (con Metro)**: SIGSEGV nativo en Fabric (`MountingCoordinator::pullTransaction`) ~0,5 s después de montar la pantalla principal, en ~1 de cada 3-5 arranques. La build release no falla (0 cierres en 8 arranques, 8/10). Si aparece en release, descartar keep-awake / fs / picker de uno en uno.
- [ ] Pesos con coma decimal también en la lista de series de Hoy (ahora `62.5` ahí y `62,5` en la sugerencia).
- [ ] Actualizar el README: sigue describiendo la app como una plantilla "Hello World".
- [ ] Aviso de eslint en `src/utils/exerciseSearch.ts` (`no-control-regex` por el `\u0000` de la expresión regular).
