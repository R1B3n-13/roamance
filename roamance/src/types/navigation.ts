export interface RouteItem {
  title: string;
  href: string;
}

export type DynamicRouteItem = (id: string) => RouteItem;
