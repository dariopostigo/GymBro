import { Alert } from 'react-native';

let alertOpen = false;

/**
 * Avisa de que un guardado ha fallado (p. ej. sin espacio en el móvil). Los
 * contextos guardan sin esperar, así que sin esto el fallo pasaría sin verse y
 * la pantalla enseñaría algo que no está en la base de datos.
 */
export function reportSaveError(error: unknown): void {
  console.warn('No se pudo guardar', error);
  if (alertOpen) return;
  alertOpen = true;
  const close = () => {
    alertOpen = false;
  };
  Alert.alert(
    'No se ha podido guardar',
    'El último cambio no se ha guardado. Comprueba que el móvil tiene espacio libre y vuelve a intentarlo.',
    [{ text: 'Entendido', onPress: close }],
    { onDismiss: close },
  );
}

/** Lanza un guardado sin esperarlo, avisando si falla. */
export function saveInBackground(save: Promise<unknown>): void {
  save.catch(reportSaveError);
}
