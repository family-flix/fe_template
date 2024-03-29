/* @refresh reload */
import { createSignal, For, JSX, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { Loader2 } from "lucide-solid";

import { Toast } from "./components/ui/toast";
import { RouteView } from "./components/ui/route-view";
import { connect } from "./domains/app/connect.web";
import { ToastCore } from "./domains/ui/toast";
import { NavigatorCore } from "./domains/navigator";
import { RouteViewCore } from "./domains/route_view";
// import { homeIndexPage } from "./store/views";
import { app, router } from "./store";
import { find_route } from "./store/routes";
import { ViewComponent } from "./types";
import { sleep } from "./utils";

import "./style.css";

app.onClickLink(({ href, target }) => {
  // const { pathname, query } = NavigatorCore.parse(href);
  // const matched = pages.find((v) => {
  //   return v.key === pathname;
  // });
  // if (!matched) {
  //   app.tip({
  //     text: ["没有匹配的页面"],
  //   });
  //   return;
  // }
  // matched.query = query as Record<string, string>;
  // if (target === "_blank") {
  //   matched.buildUrlWithPrefix(matched.query);
  //   return;
  // }
  // app.showView(matched);
  // return;
});
app.onPopState((options) => {
  const { pathname } = NavigatorCore.parse(options.pathname);
  console.log("[ROOT]index - app.onPopState", options.type, pathname);
  // const matched = pages.find((v) => {
  //   return v.key === pathname;
  // });
  // if (matched) {
  //   matched.isShowForBack = true;
  //   matched.query = router.query;
  //   app.showView(matched, { back: true });
  //   return;
  // }
  // homeIndexPage.isShowForBack = true;
  // app.showView(homeIndexPage, { back: true });
});
connect(app);

function Application() {
  const toast = new ToastCore();

  const rootView = app.view;
  console.log("[ROOT]sub views", rootView.subViews);

  const [state, setState] = createSignal(app.state);
  const [subViews, setSubViews] = createSignal(rootView.subViews);

  app.onStateChange((nextState) => {
    setState(nextState);
  });
  rootView.onViewShow((views) => {
    // const curView = views.pop();
    // if (!curView) {
    //   return;
    // }
    // if (curView.isShowForBack) {
    //   curView.isShowForBack = false;
    //   return;
    // }
    // const r = curView.buildUrl(curView.query);
    // app.setTitle(`${curView.title} - FamilyFlix`);
    // router.pushState(r);
  });
  rootView.onSubViewsChange((nextSubViews) => {
    console.log("[ROOT]rootView.onSubViewsChange", nextSubViews.length);
    setSubViews(nextSubViews);
  });
  app.onTip((msg) => {
    const { text } = msg;
    toast.show({
      texts: text,
    });
  });
  app.onError((error) => {
    // 处理各种错误？
  });
  // app.onReady(() => {
  //   router.start();
  // });
  onMount(async () => {
    rootView.appendSubView(
      new RouteViewCore({
        ...find_route("/home"),
        visible: true,
        parent: null,
        views: [
          new RouteViewCore({
            ...find_route("/home/index"),
            parent: null,
            visible: true,
          }),
        ],
      })
    );
  });
  // console.log("[]Application - before start", window.history);
  const { innerWidth, innerHeight, location } = window;
  router.prepare(location);
  (() => {
    // const { pathname } = NavigatorCore.parse(router.pathname);
    // const matched = pages.find((v) => {
    //   return v.key === pathname;
    // });
    // if (matched) {
    //   matched.query = router.query;
    //   app.showView(matched);
    //   return;
    // }
    // app.showView(homeIndexPage);
  })();
  app.start({
    width: innerWidth,
    height: innerHeight,
  });

  return (
    <div class={"screen w-screen h-screen overflow-hidden"}>
      <Show when={subViews().length !== 0}>
        <For each={subViews()}>
          {(subView, i) => {
            const PageContent = subView.component as ViewComponent;
            return (
              <RouteView class="absolute inset-0 opacity-100 dark:bg-black" store={subView} index={i()}>
                <div class="absolute right-2 bottom-2">{subView.title}</div>
                <PageContent app={app} view={subView} router={router} />
              </RouteView>
            );
          }}
        </For>
      </Show>
      <Toast store={toast} />
    </div>
  );
}

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}
render(() => <Application />, root!);
