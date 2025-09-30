import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "react-router";
import { navbarRoutes } from "~/config/navbar-routes";
import { ClientOnly } from "~/components/client-only";
import { Skeleton } from "~/components/ui/skeleton";
import type { NavbarRoute, SubRoute } from "~/types/navbar";

function ListItem({
  ...props
}: Readonly<Omit<SubRoute, "path" | "description"> & { url: string }>) {
  return (
    <li>
      <Link to={props.url} className="flex items-center gap-2">
        <props.icon className="h-5 w-5 mr-2 text-muted-foreground" />
        {props.title}
      </Link>
    </li>
  );
}

function NavigationItem({ route }: { route: NavbarRoute }) {
  return "subitems" in route ? (
    <div>
      <div className="font-bold">{route.title}</div>
      <ul className="mt-2 space-y-3 ml-1 pl-4 border-l">
        {route.subitems.map((item) => (
          <ListItem
            key={`${route.url}${item.path}`}
            title={item.title}
            icon={item.icon}
            url={`${route.url}${item.path}`}
          />
        ))}
      </ul>
    </div>
  ) : (
    <Link to={route.url}>{route.title}</Link>
  );
}

export function NavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent className="px-6 py-3 space-y-4 text-base">
        {navbarRoutes.map((route) => (
          <ClientOnly
            key={`route-${route.url}`}
            fallback={<Skeleton className="h-8" />}
          >
            <NavigationItem route={route} />
          </ClientOnly>
        ))}
      </SheetContent>
    </Sheet>
  );
}
