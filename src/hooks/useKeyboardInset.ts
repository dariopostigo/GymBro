import { useEffect, useRef, useState, type RefObject } from 'react';
import { Keyboard, Platform, type View } from 'react-native';

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

export interface KeyboardInset {
  /** Se engancha al contenedor que hay que mantener por encima del teclado. */
  ref: RefObject<View | null>;
  /** Píxeles del contenedor que tapa el teclado (0 si no lo tapa). */
  inset: number;
  visible: boolean;
}

/**
 * Mide cuánto tapa el teclado del contenedor referenciado.
 *
 * Se mide contra el propio contenedor en vez de usar la altura del teclado a
 * secas, así funciona igual si la ventana se redimensiona (adjustResize) que si
 * el teclado se dibuja por encima (iOS y Android edge-to-edge): en el primer
 * caso el solape sale 0 y no se añade relleno de más.
 */
export function useKeyboardInset(): KeyboardInset {
  const ref = useRef<View | null>(null);
  const recheck = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inset, setInset] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const measure = (keyboardTop: number) => {
      ref.current?.measureInWindow((_x, y, _width, height) => {
        if (!Number.isFinite(y) || !Number.isFinite(height)) return;
        setInset(Math.max(0, Math.round(y + height - keyboardTop)));
      });
    };

    const show = Keyboard.addListener(SHOW_EVENT, event => {
      setVisible(true);
      const keyboardTop = event.endCoordinates.screenY;
      measure(keyboardTop);
      // En Android el redimensionado de la ventana puede llegar después del
      // evento, así que se vuelve a medir con el layout ya asentado.
      if (recheck.current) clearTimeout(recheck.current);
      recheck.current = setTimeout(() => measure(keyboardTop), 180);
    });

    const hide = Keyboard.addListener(HIDE_EVENT, () => {
      if (recheck.current) clearTimeout(recheck.current);
      setVisible(false);
      setInset(0);
    });

    return () => {
      if (recheck.current) clearTimeout(recheck.current);
      show.remove();
      hide.remove();
    };
  }, []);

  return { ref, inset, visible };
}
