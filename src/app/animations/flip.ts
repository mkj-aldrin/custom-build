import { Xmodule } from "../custom-elements/module";
import { Xout } from "../custom-elements/out";

export const easingMap = {
  quintOut: "cubic-bezier(0.230, 1.000, 0.320, 1.000)",
  quintIn: "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
};

export const ani = (obj: { el: Xmodule | Xout; box: DOMRect }) => {
  const oldBox = obj.box;
  const newBox = obj.el.getBoundingClientRect();

  const posDiff = {
    x: oldBox.x - newBox.x,
    y: oldBox.y - newBox.y,
    sx: oldBox.width / newBox.width,
    sy: oldBox.height / newBox.height,
  };

  const opt: KeyframeAnimationOptions = {
    easing: easingMap.quintOut,
    duration: 150,
    fill: "both",
    composite: "accumulate",
  };

  if (posDiff.x || posDiff.y || posDiff.sy) {
  }

  obj.el.animate(
    [
      { transform: `translate(${posDiff.x}px,${posDiff.y}px)`, }, {},
    ],
    opt
  ).onfinish = (e) => {
  };
};

export function move(
  pos: { x: number, y: number },
  target: HTMLElement,
  reset = false
) {
  const opt: KeyframeAnimationOptions = {
    easing: easingMap.quintOut,
    duration: 1000,
    fill: "both",
  };

  const v = {
    x: Math.max(Math.min((pos.x - target.__drag_dragPossition.x) * 0.0625, 5), -5),
    y: Math.max(Math.min((pos.y - target.__drag_dragPossition.y) * 0.0625, 5), -5),
  };

  target.animate(
    [
      {
        transform: reset
          ? "translate(0px,0px)"
          : `translate(${v.x}px,${v.y}px)`,
      },
    ],
    opt
  );
}
