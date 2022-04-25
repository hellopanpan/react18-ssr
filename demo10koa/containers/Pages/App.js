/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Suspense, lazy } from "react";

import Html from "./Html";
import Spinner from "./Spinner";
import Layout from "./Layout";
import NavBar from "./NavBar";
import Header from "../../components/header";

const Comments = lazy(() => import("./Comments" /* webpackPrefetch: true */));
const Sidebar = lazy(() => import("./Sidebar" /* webpackPrefetch: true */));
const Post = lazy(() => import("./Post" /* webpackPrefetch: true */));

export default function App({ assets }) {
  return (
    <Suspense fallback={<Spinner />}>
      <Content />
    </Suspense>
  );
}

function Content() {
  return (
    <Layout>
      <Header></Header>
      <NavBar />
      <aside className="sidebar">
        <Suspense fallback={<Spinner />}>
          <Sidebar />
        </Suspense>
      </aside>
      <article className="post">
        <Suspense fallback={<Spinner />}>
          <Post />
        </Suspense>
        <section className="comments">
          <h2>Comments</h2>
          <Suspense fallback={<Spinner />}>
            <Comments />
          </Suspense>
        </section>
        <h2>Thanks for reading!</h2>
      </article>
    </Layout>
  );
}
