import { Xmodule } from "./module";
import { Xout } from "./out";

export function attach_drag() {
  this.addEventListener("pointerdown", (e) => {
    if (e.__detail?.attached) return;

    e.__detail = {
      attached: true,
    };

    this.dispatchEvent(
      new CustomEvent("drag:down", {
        bubbles: true,
        detail: {
          context: {},
        },
      })
    );
  });

  this.addEventListener("pointerenter", (e) => {
    this.dispatchEvent(
      new CustomEvent("drag:enter", {
        bubbles: true,
        detail: {
          context: {},
        },
      })
    );
  });

  this.addEventListener("drag:down", (e) => {
    if (e.target == this) return;
    e.detail.context[this.tagName] = this;
  });

  this.addEventListener("drag:enter", (e) => {
    if (e.target == this) return;
    e.detail.context[this.tagName] = this;
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

      console.log("down: ", e.target, this.dragContext);
    });

    this.addEventListener("drag:enter", (e) => {
      if (!this.dragEl) return;
      if (this.dragEl == e.target) return;

      const { target: enterEl, detail } = e;

      switch (enterEl.tagName) {
        case "X-MODULE": {
          if (this.dragEl.tagName == "X-OUT") {
            break;
          }

          const enterIndex = enterEl.index;
          const dragIndex = this.dragEl.index;

          const insertPosition: InsertPosition =
            enterIndex > dragIndex ? "afterend" : "beforebegin";

          enterEl.insertAdjacentElement(insertPosition, this.dragEl);

          break;
        }
        case "X-OUT": {
          if (this.dragEl.tagName == "X-MODULE") {
            break;
          }

          const enterIndex = enterEl.index;
          const dragIndex = this.dragEl.index;

          const insertPosition: InsertPosition =
            enterIndex > dragIndex ? "afterend" : "beforebegin";

          enterEl.insertAdjacentElement(insertPosition, this.dragEl);
          break;
        }
      }
    });
    this.addEventListener("pointerup", (e) => {
      this.dragEl = null;
    });
  }
}
