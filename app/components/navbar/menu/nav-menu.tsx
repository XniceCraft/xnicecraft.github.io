import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "~/components/ui/navigation-menu";
import { Link } from "react-router";
import { cn, isCurrentRoute, isInCurrentSubRoute } from "~/lib/utils";
import { ClientOnly } from "~/components/client-only";
import { Skeleton } from "~/components/ui/skeleton";
import { navbarRoutes } from "~/config/navbar-routes";

import type { ComponentProps } from "react";
import type { NavbarRoute, SubRoute } from "~/types/navbar";

const navigationStyle =
  "data-[active=true]:focus:bg-transparent data-[active=true]:hover:bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-primary/80 data-[active=true]:hover:text-primary font-semibold";

function ListItem({
  ...props
}: Readonly<Omit<SubRoute, "path"> & { url: string }>) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={props.url}
          className={cn(
            "block select-none space-y-2 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          )}
        >
          <props.icon className="mb-4 size-6" />
          <div className="text-sm font-semibold leading-none">
            {props.title}
          </div>
          {props.description ? (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {props.description}
            </p>
          ) : null}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function NavigationItem({ route }: { route: NavbarRoute }) {
  return "subitems" in route ? (
    <>
      <NavigationMenuTrigger
        data-active={isInCurrentSubRoute(route)}
        className={navigationStyle}
      >
        {route.title}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[400px] gap-3 p-1 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
          {route.subitems.map((item) => (
            <ListItem
              key={`${route.url}${item.path}`}
              description={item.description}
              icon={item.icon}
              title={item.title}
              url={`${route.url}${item.path}`}
            />
          ))}
        </ul>
      </NavigationMenuContent>
    </>
  ) : (
    <NavigationMenuLink
      data-active={isCurrentRoute(route)}
      className={navigationStyle}
      asChild
    >
      <Link to={route.url}>{route.title}</Link>
    </NavigationMenuLink>
  );
}

export function NavMenu(props: ComponentProps<typeof NavigationMenu>) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-3 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
        {navbarRoutes.map((route) => (
          <ClientOnly
            key={`route-${route.url}`}
            fallback={<Skeleton className="h-8" />}
          >
            <NavigationMenuItem>
              <NavigationItem route={route} />
            </NavigationMenuItem>
          </ClientOnly>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
