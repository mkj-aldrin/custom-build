import { build_chain, build_module, build_out } from "./build";
import "./custom-elements";
import { attach_drag_root } from "./custom-elements/drag";

const appEl = document.createElement("div");
document.body.appendChild(appEl);
appEl.id = "app";

const xRoot = document.createElement("x-root");
appEl.appendChild(xRoot);

const chains_list = document.createElement("index-list");
xRoot.appendChild(chains_list);
chains_list.classList.add("chains");

attach_drag_root(xRoot, {
  "X-CHAIN": {
    mover: () => {},
    enter: {
      "X-CHAIN": async () => false,
    },
  },
  "X-MODULE": {
    enter: {
      "X-OUT": "block",
      "X-CHAIN": (o) => {
        return new Promise((res) => {
          o.debounce_object.run(() => {
            o.enter_el.querySelector("index-list")?.appendChild(o.drag_el);
            res(true);
          });
        });
      },
    },
  },
  "X-OUT": {
    enter: {
      "X-OUT": "block",
      "X-MODULE": async (o) => {
        o.enter_el.querySelector("index-list")?.appendChild(o.drag_el);
        return true;
      },
    },
  },
});

xRoot.addEventListener("dragroot:down", (e) => {
  console.log("root down: ", e.detail.target);
  console.log("context: ", e.detail.context);
  console.log();
});
xRoot.addEventListener("dragroot:enter", (e) => {
  console.log("root enter: ", e.detail.target);
  console.log("context: ", e.detail.context);
  console.log();
});
xRoot.addEventListener("dragroot:end", (e) => {
  console.log("end");
});

[
  {
    modules: [
      { type: "PTH", outs: [1] },
      { type: "LFO", outs: [] },
      { type: "PRO", outs: [] },
    ],
  },
  {
    modules: [
      { type: "PRO", outs: [1, 2] },
      { type: "LFO", outs: [1] },
    ],
  },
].forEach((chain) => {
  const chainEl = build_chain();
  chain.modules.forEach((module) => {
    const moduleEl = build_module(module);
    chainEl.querySelector("index-list.modules")?.appendChild(moduleEl);
    module.outs.forEach((out, index) => {
      const outEl = build_out({ index });
      moduleEl.querySelector("index-list.outs")?.appendChild(outEl);
    });
  });
  chains_list.appendChild(chainEl);
});
