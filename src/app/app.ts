import { build_chain, build_module, build_out } from "./build";
import "./custom-elements";
import { attach_drag_root } from "./custom-elements/drag";

const init_arr = [
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
];

const appEl = document.createElement("div");
appEl.id = "app";

const xRoot = document.createElement("x-root");
attach_drag_root(xRoot, {
  "X-MODULE": {
    "X-OUT": (drag_el, drag_context, enter_el, enter_context) => {},
    "X-CHAIN": (
      drag_el,
      drag_context,
      enter_el,
      enter_context,
      debouce_object
    ) => {
      return new Promise((res) => {
        debouce_object.run(() => {
          enter_el.querySelector("index-list")?.appendChild(drag_el);
          res(true);
        });
      });
    },
  },
  "X-OUT": {
    "X-MODULE": (
      drag_el,
      drag_context,
      enter_el,
      enter_context,
      debouce_object
    ) => {
      return new Promise((res) => {
        enter_el.querySelector("index-list")?.appendChild(drag_el);
        res(true);
      });
    },
    "X-CHAIN": (
      drag_el,
      drag_context,
      enter_el,
      enter_context,
      debouce_object
    ) => {
      return new Promise((res) => {
        res(false);
      });
    },
  },
});

appEl.appendChild(xRoot);

const chains_list = document.createElement("index-list");
chains_list.classList.add("chains");

xRoot.appendChild(chains_list);
document.body.appendChild(appEl);

init_arr.forEach((chain) => {
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
