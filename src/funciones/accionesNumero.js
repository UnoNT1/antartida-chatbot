import nombreEmpresa from "../Utils/nombreEmpresa";

//estandariza los numeros de los tecnicos para usarlos en enviarMensajeTecnicos
async function estandarizar(numero) {
      const nombreEmp = await nombreEmpresa()

      let soloNumeros = numero.replace(/[-\s]/g, "");
      if(soloNumeros.startsWith('0')){
        soloNumeros = soloNumeros.slice(1)
      }
       
      if (!soloNumeros.startsWith("549")) {
        soloNumeros = "549" + soloNumeros;
        if (!soloNumeros.startsWith("54935815") && nombreEmp === 'Latorre') {
          return soloNumeros;
        } else if (!soloNumeros.startsWith("54935115") && (nombreEmp === 'Antartida' || nombreEmp === 'Incast')) {
          return soloNumeros;
        } else {
          soloNumeros = soloNumeros.replace(/15/, "");
          return soloNumeros;
        }
      }

  return soloNumeros
}

export default estandarizar

