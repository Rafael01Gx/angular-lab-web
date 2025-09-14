import { Signal, signal, effect } from '@angular/core';

/**
 * Cria um signal derivado com debounce.
 * @param source O signal de origem
 * @param delay Tempo de espera em ms (default 400)
 */
export function debouncedSignal<T>(source: Signal<T>, delay = 400): Signal<T> {
  const debounced = signal(source());
  let timer: any;

  effect(() => {
    const value = source(); // escuta mudanças no signal de origem
    clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.set(value);
    }, delay);
  });

  return debounced;
}
