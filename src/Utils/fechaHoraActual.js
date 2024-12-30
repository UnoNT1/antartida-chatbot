
function fechaActual(){
    const hoy = new Date(); 
    let dia = hoy.getDate(); 
    let mes = hoy.getMonth() + 1; // Enero es 0, así que sumamos 1 
    const anio = hoy.getFullYear();  
    if (dia < 10) { 
        dia = '0' + dia; 
    } 
    if (mes < 10) {
         mes = '0' + mes; 
    } 
        
    return `${anio}-${mes}-${dia}T03:00:00.000Z`;
}

function horaActual(hora){
    const ahora = new Date(); 
    let horaActual = ahora.getHours(); 
    let minutoActual = ahora.getMinutes(); 
    const minSumActual = (horaActual * 60) + minutoActual;
    
    const [horas, minutos] = hora.split(':').map(Number); // minutos de la hora que se creo la orden, obtenmida de la base de datos 
    const minutosOrden = (horas * 60) + minutos; 

    const restaMinutos = minSumActual - minutosOrden
    console.log(minSumActual, minutosOrden, ' minutos', restaMinutos)

    if (restaMinutos < 10) { 
        return true 
    } else{
        return false
    }
}

export { fechaActual, horaActual }