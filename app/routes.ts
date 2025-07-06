import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("users", "routes/users/home.tsx"),
  route("users/:userId", "routes/users/user.tsx"),
  route("users/new", "routes/users/new.tsx"),
  route("users/:userId/edit", "routes/users/edit.tsx"),
  route("users/:userId/delete", "routes/users/delete.tsx"),
  route("tasks/new/:userId", "routes/tasks/newTask.tsx"),
] satisfies RouteConfig;
