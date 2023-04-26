import { attach_drag, Draggable } from "./drag";

export class Xout extends HTMLElement {
  readonly tagName: "X-OUT";
  index: number;
  constructor() {
    super();
    // this.tagName = "X-OUT";
    this.index = 0;
    attach_drag.call(this);
  }
}
