import React from "react";
import ReactDom from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { renderRoutes } from "react-router-config";
import Routes from "./routes";
import { Provider } from "react-redux";
import { getClientStore as getStore } from "./store";
import { hydrateRoot } from "react-dom/client";
import StyleContext from "isomorphic-style-loader/StyleContext";
import { DataProvider } from "./containers/Pages/data";

const App = () => {
  const insertCss = (...styles) => {
    const removeCss = styles.map((style) => style._insertCss());
    console.log(removeCss);
    return () => removeCss.forEach((dispose) => dispose());
  };
  return (
    <Provider store={getStore()}>
      <StyleContext.Provider value={{ insertCss }}>
        <BrowserRouter>
          <div>{renderRoutes(Routes)}</div>
        </BrowserRouter>
      </StyleContext.Provider>
    </Provider>
  );
};

hydrateRoot(document.getElementById("root"), <App />);
