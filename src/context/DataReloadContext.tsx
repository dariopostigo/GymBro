import React, { createContext, useCallback, useContext, useState } from 'react';

const DataReloadContext = createContext<(() => void) | null>(null);

/**
 * Vuelve a montar todo lo que cuelga de aquí para que los contextos relean
 * AsyncStorage, por ejemplo tras importar una copia de seguridad.
 */
export function DataReloadProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const reloadData = useCallback(() => setVersion(v => v + 1), []);

  return (
    <DataReloadContext.Provider value={reloadData}>
      <React.Fragment key={version}>{children}</React.Fragment>
    </DataReloadContext.Provider>
  );
}

export function useReloadData(): () => void {
  const ctx = useContext(DataReloadContext);
  if (!ctx) throw new Error('useReloadData debe usarse dentro de DataReloadProvider');
  return ctx;
}
