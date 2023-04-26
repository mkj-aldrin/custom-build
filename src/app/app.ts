import { build_chain, build_module, build_out } from "./build";
import "./custom-elements";

const init_arr = [
  {
    modules: [
      { type: "PTH", outs: [] },
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
document.body.appendChild(appEl);

init_arr.forEach((chain) => {
  const chainEl = build_chain();
  chain.modules.forEach((module) => {
    const moduleEl = build_module(module);
    chainEl.appendChild(moduleEl);
    module.outs.forEach((out, index) => {
      const outEl = build_out({ index });
      moduleEl.querySelector("index-list.outs").appendChild(outEl);
    });
  });
  xRoot.appendChild(chainEl);
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
