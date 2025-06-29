export interface IMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: IMenuItem[];
  expanded?: boolean;
}