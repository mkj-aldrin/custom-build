export function build_chain() {
  const el = document.createElement("x-chain");
  el.innerHTML = `
  <index-list class="modules"></index-list>
  `;
  return el;
}
export function build_module({ type }) {
  const el = document.createElement("x-module");
  el.innerHTML = `
  <span>${type}</span>
  <index-list class="outs" ></index-list>
  `;
  return el;
}

export function build_parameter({}) {
  const el = document.createElement("x-module");
  return el;
}

let out_uuid = 0;

export function build_out({ index = 0 }: { index: number }) {
  const el = document.createElement("x-out");
  el.innerHTML = `
  <span>out : ${out_uuid++}</span>
  `;
  return el;
}
