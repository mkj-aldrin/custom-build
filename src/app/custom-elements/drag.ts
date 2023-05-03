import { debouce } from "../../tools/timing";
import { X } from "../../types/global";
import { ani, easingMap, move } from "../animations/flip";

export function attach_drag<T extends HTMLElement>(target: T) {
  target.__drag_dragPosition = {
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
        detail: { clientX: e.clientX, clientY: e.clientY, context: {} },
      })
    );
  });

  target.addEventListener("pointerenter", (e) => {
    target.dispatchEvent(
      new CustomEvent("drag:enter", {
        bubbles: true,
        detail: { clientX: e.clientX, clientY: e.clientY, context: {} },
      })
    );
  });

  target.addEventListener("drag:down", (e) => {
    if (e.target == target) return;
    e.detail.context[target.tagName] = target;
  });

  target.addEventListener("drag:enter", (e) => {
    if (e.target == target) return;
    e.detail.context[target.tagName] = target;
  });
}

type Context = {
  [tag: string]: HTMLElement;
};

type CallBackMap = {
  [x: string]: {
    mover?: () => void;
    enter: {
      [y: string]:
        | (({}: {
            drag_el: HTMLElement;
            drag_context: Context;
            enter_el: HTMLElement;
            enter_context: Context;
            debounce_object: ReturnType<typeof debouce>;
          }) => Promise<boolean>)
        | "block";
    };
  };
};

const debounce_object = debouce(100);

export async function attach_drag_root(
  target: HTMLElement,
  callbackMap: CallBackMap
) {
  let drag_el: X.DragElement | null = null;
  let drag_context: Context = {};
  const dragState = {
    start: {},
    end: {},
  };

  target.addEventListener("drag:down", (e) => {
    drag_el = e.target;
    drag_el.__drag = {};
    drag_context = e.detail.context;
    e.target.classList.add("drag");
    target.classList.add("dragging");

    for (const key in e.detail.context) {
      dragState.start[key] = e.detail.context[key].index;
    }
    dragState.start[drag_el.tagName] = drag_el.index;

    const move_ = callbackMap[drag_el.tagName]?.mover ?? move;

    // attach move listner here
    const {
      detail: { clientX, clientY },
    } = e;
    const dragBox = drag_el.getBoundingClientRect();

    drag_el.__drag_dragPossition = {
      x: dragBox.left + dragBox.width / 2,
      y: dragBox.top + dragBox.height / 2,
    };

    move_({ x: clientX, y: clientY }, drag_el);

    target.onpointermove = (e) => {
      if (drag_el.__drag?.ani) return;
      const pos = {
        x: e.clientX,
        y: e.clientY,
      };

      move_(pos, drag_el);
    };
  });

  target.addEventListener("drag:enter", async (e) => {
    if (!drag_el) return;
    if (drag_el == e.target) return;

    const {
      target: enter_el,
      detail: { context: enter_context },
    } = e;

    if (callbackMap[drag_el.tagName]?.enter?.[enter_el.tagName] == "block")
      return;

    for (const key in e.detail.context) {
      dragState.end[key] = e.detail.context[key].index;
    }

    dragState.end[drag_el.tagName] = enter_el.index;

    if (drag_el.tagName != enter_el.tagName) {
      dragState.end[enter_el.tagName] = enter_el.index;
      dragState.end[drag_el.tagName] =
        enter_el.querySelector("index-list").children.length;
    }

    const enterIndex = enter_el.index;
    const dragIndex = drag_el.index;

    const dragParent = drag_el.parentElement;
    const enterParent = enter_el.parentElement;

    const sameParent = dragParent == enterParent;

    const insertPosition: InsertPosition =
      sameParent && enterIndex > dragIndex ? "afterend" : "beforebegin";

    const dragBoxElements: { el: HTMLElement; box: DOMRect }[] = [];
    dragParent.querySelectorAll(drag_el.tagName).forEach((m: HTMLElement) => {
      const box = m.getBoundingClientRect();
      dragBoxElements.push({ el: m, box });
    });

    const enterBoxElements: { el: HTMLElement; box: DOMRect }[] = [];
    !sameParent &&
      enter_el.parentElement
        .querySelectorAll(enter_el.tagName)
        .forEach((m: HTMLElement) => {
          const box = m.getBoundingClientRect();
          enterBoxElements.push({ el: m, box });
        });

    let p = new Promise((res, reject) => {
      if (enter_el.tagName == drag_el.tagName) {
        debounce_object.clear();
        enter_el.insertAdjacentElement(insertPosition, drag_el);
        res(true);
      } else {
        !callbackMap[drag_el.tagName]?.enter?.[enter_el.tagName]?.({
          drag_el,
          drag_context,
          enter_el,
          enter_context,
          debounce_object,
        })?.then((state) => {
          res(state);
        }) && res(false);
      }
    });

    !sameParent && (drag_el.__drag.newHome = true);

    const res = await p;

    const dragBox = drag_el.getBoundingClientRect();
    drag_el.__drag_dragPossition = {
      x: dragBox.left + dragBox.width / 2,
      y: dragBox.top + dragBox.height / 2,
    };

    const ani_list = [dragBoxElements, enterBoxElements];

    if (res) {
      ani_list?.forEach((list) =>
        list.filter((elBox) => !elBox.el.__drag?.newHome).forEach(ani)
      );
      if (drag_el.__drag?.newHome) {
        drag_el.__drag.ani = true;

        const opt: KeyframeAnimationOptions = {
          easing: easingMap.quintOut,
          duration: 150,
          fill: "both",
        };

        drag_el.animate(
          [
            { transform: "translate(0px,0px) scale(0.85)", opacity: 0.25 },
            { transform: `translate(0px,0px) scale(1)`, opacity: 1 },
          ],
          opt
        ).onfinish = (e) => {
          delete drag_el.__drag?.ani;
        };
      }
    }

    drag_context = {
      ...drag_context,
      ...e.detail.context,
    };
  });

  target.addEventListener("pointerup", (e) => {
    target.classList.remove("dragging");
    drag_el?.classList.remove("drag");
    drag_el && move({ x: 0, y: 0 }, drag_el, true);
    drag_el = null;
    drag_context = {};
    console.log(dragState);

    target.onpointermove = null;
  });
}
