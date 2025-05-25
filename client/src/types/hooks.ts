import type { ToastActionElement, ToastProps } from '@/components/ui/toast';
import * as React from 'react';

// Toast Hook Types
export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const toastActionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

export type ToastActionType = typeof toastActionTypes;

export type ToastAction =
  | {
      type: ToastActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ToastActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ToastActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ToastActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

export interface ToastState {
  toasts: ToasterToast[];
}

export type Toast = Omit<ToasterToast, 'id'>;
