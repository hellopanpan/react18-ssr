import Home from "./containers/Pages/App";
import About from "./containers/about";
export default [
  { path: "/", component: Home, exact: true },
  {
    path: "/about",
    component: About,
    exact: true,
    loadData: About.loadData,
  },
];
