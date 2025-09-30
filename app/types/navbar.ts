import { type LucideIcon } from "lucide-react";

export interface SubRoute {
  path: string;
  icon: LucideIcon;
  title: string;
  description?: string;
};

export interface NestedRoute {
  url: string;
  title: string;
  subitems: SubRoute[];
};

export interface Route {
  url: string;
  title: string;
};

export type NavbarRoute = Route | NestedRoute;
