import { attach_drag } from "./drag";

export class Xmodule extends HTMLElement {
  index: number;
  type: string;
  readonly tagName: "X-MODULE";
  constructor() {
    super();
    this.index = 0;
    this.type = "";
    attach_drag(this);
  }
}
