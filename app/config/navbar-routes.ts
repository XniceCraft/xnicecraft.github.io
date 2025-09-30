import { Users } from "lucide-react";
import type { NavbarRoute} from "~/types/navbar";

export const navbarRoutes: NavbarRoute[] = [
  {
    url: "/",
    title: "Home",
  },
  {
    url: "/pro-evolution-soccer",
    title: "PES Edit",
    subitems: [
      {
        path: "/edit-commentary-player-list",
        icon: Users,
        title: "Edit Commentary Player List",
        description: "Manage player list for PES Commentary"
      }
    ]
  },
];