const buffers = new Map(); // { userId: { buffer: string, timeout: Timeout } }

async function respuestaTemporal(respuesta, userId) {
    // Inicializar el buffer y timeout del usuario si no existe
    if (!buffers.has(userId)) {
        buffers.set(userId, { buffer: '', timeout: null, resolve: null });
    }

    const userData = buffers.get(userId);
    console.log(userData, 'userData antes de agregar respuesta');
    // Agregar la respuesta actual al buffer del usuario
    userData.buffer = `${userData.buffer} ${respuesta}`.trim();

    // Si ya hay un timeout pendiente, lo limpiamos
    if (userData.timeout) {
        clearTimeout(userData.timeout);
    }

    // Devolvemos una promesa que se resuelve cuando pasa el tiempo sin nuevos mensajes
    return await new Promise((resolve) => {
        userData.resolve = resolve;
        userData.timeout = setTimeout(() => {
            const final = userData.buffer;
            buffers.delete(userId);
            resolve(final);
        }, 2000); // Espera 2 segundos desde el último mensaje recibido
    });
}

export default respuestaTemporal;