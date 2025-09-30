import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Route, SubRoute } from "~/types/navbar";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isInCurrentSubRoute(mainRoute: Route) {
  if (typeof window == "undefined") return false;

  return window.location.pathname.startsWith(mainRoute.url);
}


export function isCurrentRoute(mainRoute: Route, subRoute?: SubRoute) {
  if (typeof window == "undefined") return false;

  if (subRoute) {
    const fullPath = `${mainRoute.url}${subRoute.path}`;
    return fullPath === window.location.pathname;
  }
  return mainRoute.url === window.location.pathname;
}

export function getCommentaryId(commentaryName: string) {
  return parseInt(commentaryName.slice(-6), 10);
}
