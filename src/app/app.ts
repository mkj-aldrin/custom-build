import { build_chain, build_module, build_out } from "./build";
import "./custom-elements";
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

// class A {
//   constructor() {
//     this.name = "Helo";
//     this.type = "base";
//   }
// }

// class B {
//   constructor() {
//     this.type = "Cat";
//   }
// }

// class C {
//   constructor() {
//     this.value = 123;

//     Object.assign(this, new A());
//     Object.assign(this, new B());
//   }

//   say() {
//     console.log(this.name, this.type, this.value);
//   }
// }

// const c0 = new C();
// c0.say();
