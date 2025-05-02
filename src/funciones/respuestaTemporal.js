
const buffers = new Map(); // Mapa para almacenar buffers por usuario

async function respuestaTemporal(respuesta, userId) {
    // Inicializar el buffer del usuario si no existe
    if (!buffers.has(userId)) {
        buffers.set(userId, '');
    }

    // Agregar la respuesta actual al buffer del usuario
    const buffer = buffers.get(userId);
    buffers.set(userId, `${buffer} ${respuesta}`.trim());

    console.log(respuesta, buffer, 'respuesta temporal');

    // Esperar un tiempo para recibir mensajes adicionales
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 segundos

    // Guardar la respuesta combinada
    const respuestaFinal = buffers.get(userId);

    // Limpiar el buffer después de procesar
    buffers.delete(userId);

    return respuestaFinal; // Devuelve la respuesta combinada
}

export default respuestaTemporal;