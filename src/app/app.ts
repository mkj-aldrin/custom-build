import { build_chain, build_module, build_out } from "./build";
import "./custom-elements";
import { attach_drag_root } from "./custom-elements/drag";
import { Xroot } from "./custom-elements/root";

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
    mover: () => { },
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

const moduleUpdateState = {
  start: {
    target: {
      index: 0,
      type: ""
    },
    context: {}
  },
  end: {
    target: {
      index: 0,
      type: ""
    },
    context: {}
  }
}

xRoot.addEventListener("drag:down", e => {
  if (!(e.target.tagName == 'X-MODULE' || e.target.tagName == 'X-OUT')) return

  moduleUpdateState.start.target = {
    type: e.target.tagName,
    index: e.target.index
  }

  for (const key in e.detail.context) {
    const el = e.detail.context[key]
    moduleUpdateState.start.context[el.tagName] = el.index
  }
});

xRoot.addEventListener("dragroot:enter", e => {
  console.log(e.target.tagName);

  if (!(e.target.tagName == 'X-MODULE' || e.target.tagName == 'X-OUT')) return

  console.log(e.detail.context);

  // moduleUpdateState.end.target = {
  //   type: e.target.tagName,
  //   index: e.target.index
  // }

  // for (const key in e.detail.context) {
  //   const el = e.detail.context[key]
  //   moduleUpdateState.end.context[el.tagName] = el.index
  // }
})

xRoot.addEventListener("drag:end", e => {
  // console.log(moduleUpdateState.end.context);
  // console.log(moduleUpdateState.end.target);
  switch (moduleUpdateState.end.target.type) {
    case "X-MODULE": {
      // console.log(`m -r c ${moduleUpdateState.start.context['X-CHAIN']}:${moduleUpdateState.start.target.index}`);
      // console.log(`m -i c ${moduleUpdateState.end.context['X-CHAIN']}:${moduleUpdateState.end.target.index}`);
      break
    }
    case "X-CHAIN": {
      break
    }
  }
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
