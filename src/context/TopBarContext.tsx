'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface TopBarState {
  breadcrumb: React.ReactNode | null;
  actions: React.ReactNode | null;
}

interface TopBarContextType extends TopBarState {
  setTopBar: (state: Partial<TopBarState>) => void;
  resetTopBar: () => void;
}

const TopBarContext = createContext<TopBarContextType>({
  breadcrumb: null,
  actions: null,
  setTopBar: () => {},
  resetTopBar: () => {},
});

export function TopBarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TopBarState>({
    breadcrumb: null,
    actions: null,
  });

  const setTopBar = useCallback((newState: Partial<TopBarState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const resetTopBar = useCallback(() => {
    setState({ breadcrumb: null, actions: null });
  }, []);

  return (
    <TopBarContext.Provider value={{ ...state, setTopBar, resetTopBar }}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  return useContext(TopBarContext);
}

export function TopBarContent({
  breadcrumb,
  actions,
}: {
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { setTopBar, resetTopBar } = useTopBar();

  useEffect(() => {
    setTopBar({
      breadcrumb: breadcrumb ?? null,
      actions: actions ?? null,
    });
    return () => {
      resetTopBar();
    };
  }, [breadcrumb, actions, setTopBar, resetTopBar]);

  return null;
}
