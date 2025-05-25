'use client';
import AlertBox from '@/components/display/AlertBox';
import { Alert, AlertType, ReactChildren } from '@/types';
import { AlertContextType } from '@/types/contexts';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const initialState: AlertContextType = {
  addAlert: () => {},
  removeAlert: () => {},
};

const AlertContext = createContext(initialState);

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }: ReactChildren) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((type: AlertType, message: string, timeout: number) => {
    const id = uuidv4();
    const alert: Alert = {
      id,
      message,
      timeout,
      type,
    };
    setAlerts((prev) => [...prev, alert]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, timeout);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ addAlert, removeAlert }), [addAlert, removeAlert]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <div className="fixed right-0 top-0 z-40 flex flex-col gap-2 p-4">
        {alerts.map((alert) => (
          <AlertBox key={alert.id} type={alert.type} message={alert.message} />
        ))}
      </div>
    </AlertContext.Provider>
  );
}
