import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router";
import routes from "@/config/routes";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="gap-3 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
            {routes.map((route) => (
                <NavigationMenuItem key={route.url}>
                    <NavigationMenuLink className={cn(route.url === window.location.pathname && 'bg-primary text-white')} asChild>
                        <Link to={route.url}>{route.title}</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            ))}
        </NavigationMenuList>
    </NavigationMenu>
);
