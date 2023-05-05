import { attach_drag } from "./drag";

let out_uuid = 0

export class Xout extends HTMLElement {
  readonly tagName: "X-OUT";
  index: number;
  readonly outIndex: number
  constructor() {
    super();
    this.index = 0;
    this.outIndex = out_uuid++
    attach_drag(this);
  }
}
