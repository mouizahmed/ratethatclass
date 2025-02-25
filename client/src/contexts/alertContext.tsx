'use client';
import AlertBox from '@/components/display/AlertBox';
import { Alert, AlertType, ReactChildren } from '@/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  addAlert: (type: AlertType, message: string, timeout = 3000) => {},
  removeAlert: (id: string) => {},
};

const AlertContext = createContext(initialState);

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }: ReactChildren) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (type: AlertType, message: string, timeout = 3000) => {
    const id = uuidv4();
    const alert: Alert = {
      id: id,
      message: message,
      timeout: timeout,
      type: type,
    };
    setAlerts((prev) => [...prev, alert]);

    setTimeout(() => setAlerts((prev) => prev.filter((alert) => alert.id !== id)), timeout);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ addAlert, removeAlert }}>
      {children}
      <div className="fixed right-0 top-0 z-40 flex flex-col gap-2 p-4">
        {alerts.map((alert) => (
          <AlertBox key={alert.id} type={alert.type} message={alert.message} />
        ))}
      </div>
    </AlertContext.Provider>
  );
}
