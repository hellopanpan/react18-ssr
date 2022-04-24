import Koa from "koa";
import koaStatic from "koa-static";
import React from "react";
import { StaticRouter } from "react-router-dom";
import { renderToPipeableStream } from "react-dom/server";
import Routes from "./routes";
import { renderRoutes, matchRoutes } from "react-router-config";
import { Provider } from "react-redux";
import StyleContext from "isomorphic-style-loader/StyleContext";
import { getServerSore as getStore } from "./store";
import { DataProvider } from "./containers/Pages/data";
import Express from "express";
let Stream = require("stream");

const app = new Express();
// app.use(koaStatic("public"));

app.get("/", async (req, res) => {
  const store = getStore();
  const matchArr = matchRoutes(Routes, req.path);
  let promiseArr = [];
  matchArr.forEach((item) => {
    if (item.route.loadData) {
      promiseArr.push(item.route.loadData(store));
    }
  });
  await Promise.all(promiseArr);
  let context = { css: [] };
  const css = new Set();
  const insertCss = (...styles) =>
    styles.forEach((style) => css.add(style._getCss()));

  const stream = renderToPipeableStream(
    <Provider store={store}>
      <StyleContext.Provider value={{ insertCss }}>
        <StaticRouter location={res.path} context={context}>
          <div>{renderRoutes(Routes)}</div>
        </StaticRouter>
      </StyleContext.Provider>
    </Provider>,
    {
      onShellReady() {
        // If something errored before we started streaming, we set the error code appropriately.
        console.log("stream---333-", stream);
        console.log("isStream-2277-", stream instanceof Stream);
        stream.pipe(res);
      },
      onError(x) {
        console.error("x---", x);
      },
    }
  );
  setTimeout(() => stream.abort(), 100);
});
app.listen(3010, () => {
  console.log("listen:3010");
});
