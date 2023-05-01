import { debouce } from "../../tools/timing";
import { X } from "../../types/global";
import { ani, move } from "../animations/flip";
import { build_module } from "../build";
import { Xchain } from "./chain";
import { Xmodule } from "./module";
import { Xout } from "./out";
import { Xroot } from "./root";

export function attach_drag<T extends HTMLElement>(target: T) {
  target.dragPosition = {
    x: 0,
    y: 0,
  };

  target.addEventListener("pointerdown", (e) => {
    if (e.__detail?.attached) return;

    e.__detail = {
      attached: true,
    };

    target.dispatchEvent(
      new CustomEvent("drag:down", {
        bubbles: true,
        detail: {
          clientX: e.clientX,
          clientY: e.clientY,
          context: {},
        },
      })
    );
  });

  target.addEventListener("pointerenter", (e) => {
    target.dispatchEvent(
      new CustomEvent("drag:enter", {
        bubbles: true,
        detail: {
          clientX: e.clientX,
          clientY: e.clientY,
          context: {},
        },
      })
    );
  });

  target.addEventListener("drag:down", (e) => {
    if (e.target == target) return;
    // console.log(target);

    e.detail.context[target.tagName] = target;
  });

  target.addEventListener("drag:enter", (e) => {
    if (e.target == target) return;
    // console.log(target, target.tagName);
    e.detail.context[target.tagName] = target;
    // console.log(e.detail.context);
  });
}

const enterDebounce = debouce(100);

type Context = {
  "X-CHAIN"?: Xchain;
  "X-MODULE"?: Xmodule;
  "X-OUT"?: Xout;
};

type ContextMap<T extends HTMLElement> = {
  string: T;
};

// type CallBackMap = Map<
//   [string, string],
//   (
//     drag_el: HTMLElement,
//     drag_context: ContextMap<HTMLElement>,
//     ente_el: HTMLElement,
//     enter_conted: ContextMap<HTMLElement>
//   ) => void
// >;

type CallBackMap = {
  [x in string]: {
    [y in string]: (
      drag_el: HTMLElement,
      drag_context: Context,
      enter_el: HTMLElement,
      enter_context: Context,
      debouce_object: ReturnType<typeof debouce>
    ) => Promise<boolean>;
  };
};

// type CallBackMap = Record<
//   X.DragEvent["target"]["tagName"],
//   (
//     drag_el: Xmodule | Xout,
//     drag_context: Context,
//     enter_el: Xmodule | Xout,
//     enter_context: Context,
//     insertPosition: InsertPosition
//   ) => { el: Xmodule | Xout; box: DOMRect }[][]
// >;

const parent_debouce = debouce(100);

export async function attach_drag_root(
  target: Xroot,
  callbackMap: CallBackMap
) {
  target.drag_el = null;
  target.drag_context = {};

  target.addEventListener("drag:down", (e) => {
    target.drag_el = e.target;
    target.drag_context = e.detail.context;
    e.target.classList.add("drag");
  });

  target.addEventListener("drag:enter", async (e) => {
    if (!target.drag_el) return;
    if (target.drag_el == e.target) return;

    const enter_target = e.target;

    const {
      target: enter_el,
      detail: { context: enter_context },
    } = e;

    const enterIndex = enter_el.index;
    const dragIndex = target.drag_el.index;

    const dragParent = target.drag_el.parentElement;
    const enterParent = enter_el.parentElement;

    const insertPosition: InsertPosition =
      dragParent != enterParent
        ? "beforebegin"
        : enterIndex > dragIndex
        ? "afterend"
        : "beforebegin";

    const dragBoxElements: { el: Xmodule; box: DOMRect }[] = [];
    dragParent.querySelectorAll(target?.drag_el.tagName).forEach((m) => {
      const box = m.getBoundingClientRect();
      dragBoxElements.push({ el: m, box });
    });

    const enterBoxElements: { el: Xmodule; box: DOMRect }[] = [];

    enterParent != dragParent &&
      enter_el.parentElement.querySelectorAll(enter_el.tagName).forEach((m) => {
        const box = m.getBoundingClientRect();
        enterBoxElements.push({ el: m, box });
      });

    let p = new Promise((res, reject) => {
      if (enter_el.tagName == target.drag_el.tagName) {
        parent_debouce.clear();
        enter_el.insertAdjacentElement(insertPosition, target.drag_el);
        res(true);
      } else {
        !callbackMap[target.drag_el.tagName]
          ?.[enter_el.tagName]?.(
            target.drag_el,
            target.drag_context,
            enter_el,
            enter_context,
            parent_debouce
          )
          ?.then((state) => {
            res(state);
          }) && res(false);
      }
    });

    const res = await p;

    const ani_list = [dragBoxElements, enterBoxElements];

    res && ani_list?.forEach((list) => list.forEach(ani));

    target.drag_context = {
      ...target.drag_context,
      ...e.detail.context,
    };
  });

  target.addEventListener("pointerup", (e) => {
    target.drag_el?.classList.remove("drag");
    target.drag_el = null;
    target.drag_context = {};
  });
}

export class DragRoot extends HTMLElement {
  dragEl: Xmodule | Xout | null;
  dragContext: {};
  constructor() {
    super();

    this.addEventListener("drag:down", (e) => {
      if (e.target.tagName == "X-CHAIN") return;
      this.dragEl = e.target;
      this.dragContext = e.detail.context;
      // console.log(this.dragContext);

      this.classList.add("dragging");
      this.dragEl.classList.add("drag");

      const box = this.dragEl.getBoundingClientRect();
      this.dragEl.dragPossition = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
      };

      const { clientX, clientY } = e.detail;
      move([clientX, clientY], this.dragEl);

      this.onpointermove = (e) => {
        const { clientX, clientY } = e;
        move([clientX, clientY], this.dragEl);
      };
    });

    this.addEventListener("drag:enter", (e) => {
      if (!this.dragEl) return;
      if (this.dragEl == e.target) return;

      const { target: enterEl, detail } = e;

      switch (enterEl.tagName) {
        case "X-MODULE": {
          enterDebounce.clear();

          if (this.dragEl.tagName == "X-OUT") {
            console.log(detail.context, enterEl, this.dragContext);

            if (enterEl == this.dragContext["X-MODULE"]) return;

            const preBox = this.dragEl.getBoundingClientRect();
            const b = { el: this.dragEl, box: preBox };

            const dragBoxElements: { el: Xmodule; box: DOMRect }[] = [];
            this.querySelectorAll("x-module").forEach((m) => {
              const box = m.getBoundingClientRect();
              dragBoxElements.push({ el: m, box });
            });

            enterEl.querySelector("index-list").appendChild(this.dragEl);

            const box = this.dragEl.getBoundingClientRect();
            this.dragEl.dragPossition = {
              x: box.left + box.width / 2,
              y: box.top + box.height / 2,
            };

            ani(b);
            dragBoxElements.forEach(ani);

            break;
          }

          const enterIndex = enterEl.index;
          const dragIndex = this.dragEl.index;

          const insertPosition: InsertPosition =
            enterIndex > dragIndex ? "afterend" : "beforebegin";

          const dragBoxElements: { el: Xmodule; box: DOMRect }[] = [];
          this.querySelectorAll("x-module").forEach((m) => {
            const box = m.getBoundingClientRect();
            dragBoxElements.push({ el: m, box });
          });

          enterEl.insertAdjacentElement(insertPosition, this.dragEl);

          const box = this.dragEl.getBoundingClientRect();
          this.dragEl.dragPossition = {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
          };

          dragBoxElements.forEach(ani);

          // break;
          this.dragContext = {
            ...detail.context,
            "X-MODULE": enterEl,
          };
        }
        case "X-OUT": {
          enterDebounce.clear();
          if (this.dragEl.tagName == "X-MODULE") {
            break;
          }

          const enterIndex = enterEl.index;
          const dragIndex = this.dragEl.index;

          const insertPosition: InsertPosition =
            enterIndex > dragIndex ? "afterend" : "beforebegin";

          const dragBoxElements: { el: Xout; box: DOMRect }[] = [];
          this.querySelectorAll("x-out").forEach((m) => {
            const box = m.getBoundingClientRect();
            dragBoxElements.push({ el: m, box });
          });

          enterEl.insertAdjacentElement(insertPosition, this.dragEl);

          const box = this.dragEl.getBoundingClientRect();
          this.dragEl.dragPossition = {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
          };

          dragBoxElements.forEach(ani);

          break;
        }
        case "X-CHAIN": {
          enterDebounce.run(() => {
            if (this.dragEl.tagName == "X-OUT") {
              const newModule = build_module({ type: "PTH" });
              newModule.querySelector("index-list")?.appendChild(this.dragEl);
              enterEl.querySelector("index-list")?.appendChild(newModule);
              return;
            }
            enterEl.querySelector("index-list")?.appendChild(this.dragEl);
          });
        }
      }

      // const box = this.dragEl.getBoundingClientRect();
      // this.dragEl.dragPossition = {
      //   x: box.left + box.width / 2,
      //   y: box.top + box.height / 2,
      // };
    });

    this.addEventListener("pointerup", (e) => {
      if (!this.dragEl) return;

      move([0, 0], this.dragEl, true);

      this.classList.remove("dragging");
      this.dragEl.classList.remove("drag");

      this.onpointermove = null;
      this.dragEl = null;
    });
  }
}
