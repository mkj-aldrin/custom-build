import { Xchain } from "../app/custom-elements/chain";
import { IndexList } from "../app/custom-elements/index-list";
import { Xmodule } from "../app/custom-elements/module";
import { Xout } from "../app/custom-elements/out";
import { Xparamter } from "../app/custom-elements/parameter";
import { Xroot } from "../app/custom-elements/root";

declare namespace X {
  export interface DragEvent
    extends CustomEvent<{
      context: {};
    }> {
    target: Xchain | Xmodule | Xout;
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
