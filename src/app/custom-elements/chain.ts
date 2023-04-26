import { attach_drag, Draggable } from "./drag";

export class Xchain extends HTMLElement {
  index: number;
  readonly tagName: "X-CHAIN";
  constructor() {
    super();
    this.index = 0;
    attach_drag.call(this);
    // this.tagName = "X-CHAIN";

    new MutationObserver((mutations) => {
      this.querySelectorAll("x-module").forEach((m, i) => {
        m.index = i;
      });
    }).observe(this, {
      childList: true,
    });
  }
}
