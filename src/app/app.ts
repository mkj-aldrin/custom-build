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

let updateState = {
  start: {
    target: {
      el: null,
      type: null,
      index: 0
    },
    context: {}
  },
  end: {
    target: {
      type: null,
      index: 0
    },
    context: {}
  }
}

xRoot.addEventListener("dragroot:down", (e) => {
  const { target, context } = e.detail

  updateState.start.target = {
    el: target,
    type: target.tagName,
    index: target.index
  }

  for (const key in context) {
    updateState.start.context[key] = context[key].index
  }
});

xRoot.addEventListener("dragroot:enter", (e) => {
  const { target, context } = e.detail

  updateState.end.target = {
    type: target.tagName,
    index: target.index
  }

  for (const key in context) {
    updateState.end.context[key] = context[key].index
  }
});

xRoot.addEventListener("dragroot:end", (e) => {
  // console.log(updateState);

  const start = updateState.start
  const end = updateState.end

  const handle = {
    "X-MODULE": {
      "X-MODULE": () => {
        console.log(`m -r c ${start.context['X-CHAIN']}:${start.target.index}`);
        console.log(`m -i c ${end.context['X-CHAIN']}:${end.target.index}`);
      },
      "X-CHAIN": () => {
        console.log(`m -r c ${start.context['X-CHAIN']}:${start.target.index}`);
        console.log(`m -a c ${end.target.index}`);
      }
    },
    "X-OUT": {
      "X-MODULE": () => {
        console.log(`o -r ${start.target.el.outIndex}`);
      }
    }
  }

  handle[start.target.type]?.[end.target.type]?.()

  updateState = {
    start: {
      target: {
        el: null,
        type: null,
        index: 0
      },
      context: {}
    },
    end: {
      target: {
        type: null,
        index: 0
      },
      context: {}
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
