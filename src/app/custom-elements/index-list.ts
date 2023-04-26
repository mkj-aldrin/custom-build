export class IndexList extends HTMLElement {
  constructor() {
    super();
    new MutationObserver((mutations) => {
      const children = this.children as HTMLCollectionOf<
        HTMLElement & { index: number }
      >;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        child.index = i;
      }
    }).observe(this, {
      childList: true,
    });
  }
}
