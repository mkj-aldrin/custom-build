import { attach_drag } from "./drag";

export class Xout extends HTMLElement {
  readonly tagName: "X-OUT";
  index: number;
  constructor() {
    super();
    this.index = 0;
    attach_drag(this);
  }
}
