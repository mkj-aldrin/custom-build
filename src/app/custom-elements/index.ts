import { Xchain } from "./chain";
import { IndexList } from "./index-list";
import { Xmodule } from "./module";
import { Xout } from "./out";
import { Xparamter } from "./parameter";
import { Xroot } from "./root";

// customElements.define("x-root", Xroot);
customElements.define("x-chain", Xchain);
customElements.define("x-module", Xmodule);
customElements.define("x-parameter", Xparamter);
customElements.define("x-out", Xout);
customElements.define("index-list", IndexList);
