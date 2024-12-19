//estandariza los numeros de los tecnicos para usarlos en enviarMensajeTecnicos
function estandarizar(numero) {

      let soloNumeros = numero.replace(/[-\s]/g, "");
      if(soloNumeros.startsWith('0')){
        soloNumeros = soloNumeros.slice(1)
      }
       
      if (!soloNumeros.startsWith("549")) {
        soloNumeros = "549" + soloNumeros;
        if (!soloNumeros.startsWith("54935115")) {
          return soloNumeros;
        } else {
          soloNumeros = soloNumeros.replace(/15/, "");
          return soloNumeros;
        }
      }

    return soloNumeros
}

export default estandarizar

