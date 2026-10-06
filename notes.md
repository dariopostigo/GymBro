# GymBro — tareas pendientes

## Prioridad alta

- [ ] **Copia de seguridad (exportar / importar datos)**
  Todo vive solo en AsyncStorage: si se desinstala la app, se reinstala o se cambia de móvil, se pierden rutinas, historial y favoritos.
  - Botón "Exportar datos" que genere un archivo JSON y abra el menú de compartir (Drive, Telegram...).
  - Botón "Importar datos" que lo restaure (pasando los ids por `canonicalExerciseId`, como al cargar).

- [ ] **Temporizador de descanso**
  - Arranca solo al apuntar una serie.
  - Duración configurable (p. ej. 90 s por defecto).
  - Vibración al terminar.

- [ ] **Sugerencia de sobrecarga progresiva**
  Si en la última sesión se llegó a `targetRepsMax` en todas las series, proponer subir peso (p. ej. +2,5 kg) en vez de repetir lo de la última vez.

- [ ] **Pantalla siempre encendida** mientras se está en la pestaña Hoy.

## Muy útil

- [ ] **Aviso de récord** al apuntar una serie que supera la mejor marca del ejercicio (el cálculo ya existe en el historial).
- [ ] **Series por grupo muscular a la semana** en Progreso, para ver qué músculos se quedan cortos.
- [ ] **Ficha del ejercicio** con descripción, músculos principales y secundarios y fotos (las descripciones en español ya están en el catálogo pero no se muestran).
- [ ] **Editar una serie ya apuntada** (ahora solo se puede borrar).
- [ ] **Notas** por ejercicio o por sesión (altura del asiento, molestias...).

## Si apetece

- [ ] Registro de peso corporal con gráfica.
- [ ] Calendario con los días entrenados.
- [ ] Calculadora de discos (qué discos poner para un peso dado).
- [ ] Series de calentamiento sugeridas.

## Diseño

- [ ] **Revisión del diseño con capturas** de cada pantalla (por adb con el móvil conectado): espacios, jerarquía, legibilidad durante el entreno y tamaño de los botones.

## Mantenimiento

- [ ] Actualizar el README: sigue describiendo la app como una plantilla "Hello World".
- [ ] Aviso de eslint en `src/utils/exerciseSearch.ts` (`no-control-regex` por el `\u0000` de la expresión regular).
