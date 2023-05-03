import { debouce } from "../../tools/timing";
import { ani, move } from "../animations/flip";

export function attach_drag<T extends HTMLElement>(target: T) {
  target.__drag_dragPosition = {
    x: 0,
    y: 0,
  };

  target.addEventListener("pointerdown", (e) => {
    if (e.__detail?.attached) return;

    e.__detail = {
      attached: true
    };

    target.dispatchEvent(
      new CustomEvent("drag:down", {
        bubbles: true,
        detail: { clientX: e.clientX, clientY: e.clientY, context: {} }
      })
    );
  });

  target.addEventListener("pointerenter", (e) => {
    target.dispatchEvent(
      new CustomEvent("drag:enter", {
        bubbles: true,
        detail: { clientX: e.clientX, clientY: e.clientY, context: {} }
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
  [tag in string]: HTMLElement
};

// type Mover = () => void
// type InnerMap = Record<string, ({ }: {
//   drag_el: HTMLElement,
//   drag_context: Context,
//   enter_el: HTMLElement,
//   enter_context: Context,
//   debounce_object: ReturnType<typeof debouce>
// }
// ) => Promise<boolean>>

// interface H extends InnerMap {
//   mover: Mover
// }

type CallBackMap = {
  [x: string]: {
    [y: string]: ((
      { }: {
        drag_el: HTMLElement,
        drag_context: Context,
        enter_el: HTMLElement,
        enter_context: Context,
        debounce_object: ReturnType<typeof debouce>
      }
    ) => Promise<boolean>) | "block";
  };
};

const debounce_object = debouce(100);

export async function attach_drag_root(
  target: HTMLElement,
  callbackMap: CallBackMap
) {

  let drag_el: HTMLElement & { index?: number } | null = null;
  let drag_context: Context = {};

  target.addEventListener("drag:down", (e) => {
    drag_el = e.target;
    drag_context = e.detail.context;
    e.target.classList.add("drag");
    target.classList.add("dragging")

    const move_ = callbackMap[drag_el.tagName]?.mover ?? move

    // attach move listner here
    const { detail: { clientX, clientY } } = e
    const dragBox = drag_el.getBoundingClientRect()
    drag_el.__drag_dragPossition = { x: dragBox.left + dragBox.width / 2, y: dragBox.top + dragBox.height / 2 }

    move_({ x: clientX, y: clientY }, drag_el)

    target.onpointermove = e => {
      const pos = {
        x: e.clientX,
        y: e.clientY
      }

      move_(pos, drag_el)
    }

  });

  target.addEventListener("drag:enter", async (e) => {
    if (!drag_el) return;
    if (drag_el == e.target) return;

    const {
      target: enter_el,
      detail: { context: enter_context },
    } = e;

    if (callbackMap[drag_el.tagName]?.[enter_el.tagName] == 'block') return

    const enterIndex = enter_el.index;
    const dragIndex = drag_el.index;

    const dragParent = drag_el.parentElement;
    const enterParent = enter_el.parentElement;

    const insertPosition: InsertPosition = dragParent == enterParent && enterIndex > dragIndex ? "afterend" : "beforebegin"

    const dragBoxElements: { el: HTMLElement; box: DOMRect }[] = [];
    dragParent.querySelectorAll(drag_el.tagName).forEach((m: HTMLElement) => {
      const box = m.getBoundingClientRect();
      dragBoxElements.push({ el: m, box });
    });

    const enterBoxElements: { el: HTMLElement; box: DOMRect }[] = [];
    enterParent != dragParent &&
      enter_el.parentElement.querySelectorAll(enter_el.tagName).forEach((m: HTMLElement) => {
        const box = m.getBoundingClientRect();
        enterBoxElements.push({ el: m, box });
      });

    // callbackMap[enter_el.tagName][drag_el.tagName]({
    //   drag_el,
    //   drag_context,
    //   enter_el,
    //   enter_context,
    //   debounce_object
    // });

    // console.log(enter_el.tagName, drag_el.tagName);


    let p = new Promise((res, reject) => {
      if (enter_el.tagName == drag_el.tagName) {
        debounce_object.clear();
        enter_el.insertAdjacentElement(insertPosition, drag_el);
        res(true);
      } else {
        !callbackMap[drag_el.tagName]
          ?.[enter_el.tagName]?.({
            drag_el,
            drag_context,
            enter_el,
            enter_context,
            debounce_object
          })
          ?.then((state) => {
            res(state);
          }) && res(false);
      }
    });


    const res = await p;

    const dragBox = drag_el.getBoundingClientRect()
    drag_el.__drag_dragPossition = { x: dragBox.left + dragBox.width / 2, y: dragBox.top + dragBox.height / 2 }

    const ani_list = [dragBoxElements, enterBoxElements];

    res && ani_list?.forEach((list) => list.forEach(ani));

    drag_context = {
      ...drag_context,
      ...e.detail.context,
    };
  });

  target.addEventListener("pointerup", (e) => {
    target.classList.remove("dragging")
    drag_el?.classList.remove("drag");
    drag_el && move({ x: 0, y: 0 }, drag_el, true)
    drag_el = null;
    drag_context = {};

    target.onpointermove = null
  });
}