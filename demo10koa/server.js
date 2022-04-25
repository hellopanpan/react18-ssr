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

const app = new Koa();
app.use(koaStatic("public"));

function createServerData() {
  let done = false;
  let promise = null;
  return {
    read() {
      if (done) {
        return;
      }
      if (promise) {
        throw promise;
      }
      promise = new Promise((resolve) => {
        setTimeout(() => {
          done = true;
          promise = null;
          resolve();
        }, 2000);
      });
      throw promise;
    },
  };
}

app.use(async (ctx) => {
  const store = getStore();
  const matchArr = matchRoutes(Routes, ctx.request.path);
  let promiseArr = [];
  matchArr.forEach((item) => {
    if (item.route.loadData) {
      promiseArr.push(item.route.loadData(store));
    }
  });
  await Promise.all(promiseArr);
  console.log("loading data");
  let context = { css: [] };
  const css = new Set();
  const insertCss = (...styles) =>
    styles.forEach((style) => css.add(style._getCss()));

  const prefix = `
    <html>
      <head>
        <title>ssr</title>
        <style>${[...css].join("")}</style>
      </head>
      <body>
        <div id="root">`;
  const endfix = `</div>
        <script>
         window.context = {
          state: ${JSON.stringify(store.getState())}
        }
        </script>
        <script src="./index.js"></script>
      </body>
    </html>`;

  await new Promise((_resolve, reject) => {
    const { pipe } = renderToPipeableStream(
      <Provider store={store}>
        <StyleContext.Provider value={{ insertCss }}>
          <StaticRouter location={ctx.request.path} context={context}>
            <DataProvider data={createServerData()}>
              <div>{renderRoutes(Routes)}</div>
            </DataProvider>
          </StaticRouter>
        </StyleContext.Provider>
      </Provider>,
      {
        onShellReady() {
          ctx.respond = false;
          ctx.res.statusCode = 200;
          ctx.response.set("content-type", "txt/html");
          ctx.type = "html";
          ctx.res.write(prefix);
          pipe(ctx.res);
          ctx.res.write(endfix);
        },
        onShellError() {
          reject();
        },
      }
    );
  });
});

app.listen(3010, () => {
  console.log("listen:3010");
});
