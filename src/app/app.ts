import { build_chain, build_module, build_out } from "./build";
import "./custom-elements";
import { attach_drag_root } from "./custom-elements/drag";
// import { attach_drag_section } from "./custom-elements/drag";

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
  "X-OUT": (drag_el, drag_context) => {},
  "X-MODULE": (drag_el, drag_context, e) => {
    const {
      target: enterEl,
      detail: { context: enter_context },
    } = e;

    const enterIndex = enterEl.index;
    const dragIndex = drag_el.index;

    const insertPosition: InsertPosition =
      enterIndex > dragIndex ? "afterend" : "beforebegin";

    // const dragBoxElements: { el: Xmodule; box: DOMRect }[] = [];
    // this.querySelectorAll("x-module").forEach((m) => {
    //   const box = m.getBoundingClientRect();
    //   dragBoxElements.push({ el: m, box });
    // });

    enterEl.insertAdjacentElement(insertPosition, drag_el);

    // const box = this.dragEl.getBoundingClientRect();
    // this.dragEl.dragPossition = {
    //   x: box.left + box.width / 2,
    //   y: box.top + box.height / 2,
    // };
  },
  "X-CHAIN": (drag_el, drag_context) => {},
});
appEl.appendChild(xRoot);

const chains_list = document.createElement("index-list");
chains_list.classList.add("chains");
// attach_drag_section(chains_list);

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
