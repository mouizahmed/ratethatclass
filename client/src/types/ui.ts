export interface Alert {
  type: AlertType;
  message: string;
  timeout: number | 3000;
  id: string;
}

export type AlertType = 'default' | 'destructive';

export interface BreadcrumbInfo {
  link: string | null;
  label: string;
}

export interface Search {
  type: string;
}
