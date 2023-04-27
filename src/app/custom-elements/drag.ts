import { debouce } from "../../tools/timing";
import { X } from "../../types/global";
import { ani, move } from "../animations/flip";
import { build_module } from "../build";
import { Xmodule } from "./module";
import { Xout } from "./out";

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
    e.detail.context[target.tagName] = target;
  });
}

const enterDebounce = debouce(100);

type CallBackMap = Record<
  X.DragEvent["target"]["tagName"],
  <T extends HTMLElement>(
    drag_el: T,
    drag_context: Record<
      X.DragEvent["target"]["tagName"],
      X.DragEvent["target"]
    >,
    e: X.DragEvent
  ) => void
>;

export function attach_drag_root<T extends HTMLElement>(
  target: T,
  callbackMap: CallBackMap
) {
  target.drag_el = null;
  target.drag_context = {};

  target.addEventListener("drag:down", (e) => {
    target.drag_el = e.target;
    target.drag_context = e.detail.context;
  });

  target.addEventListener("drag:enter", (e) => {
    if (!target.drag_el) return;
    if (target.drag_el == e.target) return;

    const enter_target = e.target;

    callbackMap[enter_target.tagName](target.drag_el, target.drag_context, e);

    target.drag_context = { ...e.detail.context, [target.tagName]: target };
  });

  target.addEventListener("pointerup", (e) => {
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
