//Toma el mensaje enviado por la IA para generar el reclamo
function tomarDatosReclamo(mensaje) {
    // Divide el mensaje en líneas
    const lineas = mensaje.split('\n').map(linea => linea.trim());

    // Filtra las líneas que contienen ':'
    const reclamo = lineas
        .filter(linea => linea.includes(':'))
        .map(linea => {
            // Divide cada línea en clave y valor
            const [clave, valor] = linea.split(':').map(d => d.trim());
            return [clave.replace(/\*/g, ''), valor]; // Elimina '*' de la clave
        });

    // Convierte el array de pares clave-valor en un objeto
    const reclamoObjetos = reclamo.reduce((obj, [clave, valor]) => {
        obj[clave] = valor;
        return obj;
    }, {});

    return reclamoObjetos;
}

export default tomarDatosReclamo;