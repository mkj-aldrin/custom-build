import { buildModulesMenu } from "./modules-menu";

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    window.__state.menu.ctrl = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.ctrlKey) {
    window.__state.menu.ctrl = false;
  }
});
