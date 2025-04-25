
let bufferRespuesta = '';
async function respuestaTemporal(respuesta){
    // Agregar la respuesta actual al buffer
    bufferRespuesta += ` ${respuesta}`.trim();

    // Esperar un tiempo para recibir mensajes adicionales
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 segundos

    // Guardar la respuesta combinada
    const respuestaFinal = bufferRespuesta.trim();

    // Limpiar el buffer después de procesar
    bufferRespuesta = '';

    return respuestaFinal; // Devuelve la respuesta combinada
}

export default respuestaTemporal;