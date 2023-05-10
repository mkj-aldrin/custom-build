const moduleTypes = ["PTH", "LFO", "PRO", "BCH"];

function choiceHandler(e:PointerEvent) {
    
}

export function buildModulesMenu() {
  const el = document.createElement("menu");
  el.id = "modules-menu";
  const modulesList = document.createElement("ul");
  el.appendChild(modulesList);

  modulesList.innerHTML = `
    ${moduleTypes.map((m) => `<li>${m}</li>`).join("")}
  `;

  return el;
}
