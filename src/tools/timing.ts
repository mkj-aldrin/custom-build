export function debouce(window: number) {
  let t: number;
  return {
    run: (fn: (...args: any[]) => void) => {
      t = setTimeout(fn, window);
    },
    clear: () => {
      console.log("timeout id: ", t);

      clearTimeout(t);
    },
  };
}
