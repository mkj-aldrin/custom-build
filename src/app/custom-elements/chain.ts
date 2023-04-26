import { attach_drag } from "./drag";

export class Xchain extends HTMLElement {
  index: number;
  readonly tagName: "X-CHAIN";
  constructor() {
    super();
    this.index = 0;
    attach_drag(this);
  }
}
