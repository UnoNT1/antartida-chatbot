//metodo sacado de builderBot para que al recibir otro mensaje del cliente en simultaneo le responda diferente
export function debounce(func, mseg) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), mseg)
  }
}

