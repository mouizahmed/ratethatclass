/* eslint-disable */
import { SQLDate } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCurrentSQLDate = (): SQLDate => {
  const myDate = new Date();
  const year = myDate.getFullYear();
  const month = String(myDate.getMonth() + 1).padStart(2, '0');
  const day = String(myDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as SQLDate;
};

export function descendingComparator(a: { [x: string]: number }, b: { [x: string]: number }, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order: 'asc' | 'desc', orderBy: string) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}
