import { Xchain } from "../app/custom-elements/chain";
import { IndexList } from "../app/custom-elements/index-list";
import { Xmodule } from "../app/custom-elements/module";
import { Xout } from "../app/custom-elements/out";
import { Xparamter } from "../app/custom-elements/parameter";
import { Xroot } from "../app/custom-elements/root";

export declare namespace X {
  type DragElement = HTMLElement & { index?: number; __drag?: {} };
  export interface DragEvent
    extends CustomEvent<{
      clientX: number;
      clientY: number;
      context: {};
    }> {
    target: DragElement;
  }
}
declare global {
  interface HTMLElementEventMap {
    pointerdown: PointerEvent & {
      __detail: {
        attached: boolean;
      };
    };
    "drag:down": X.DragEvent;
    "drag:enter": X.DragEvent;
  }
  interface HTMLElementTagNameMap {
    "x-root": Xroot;
    "x-chain": Xchain;
    "x-module": Xmodule;
    "x-parameter": Xparamter;
    "x-out": Xout;
    "index-list": IndexList;
  }
}

export {};
