import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  ...prefix("pro-evolution-soccer", [
    route(
      "edit-commentary-player-list",
      "routes/pro-evolution-soccer/edit-commentary-player-list.tsx",
    ),
  ]),
] satisfies RouteConfig;
