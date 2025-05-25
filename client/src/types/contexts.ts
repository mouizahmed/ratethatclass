import { AlertType } from './ui';

// Alert Context Types
export interface AlertContextType {
  addAlert: (type: AlertType, message: string, timeout: number) => void;
  removeAlert: (id: string) => void;
}
