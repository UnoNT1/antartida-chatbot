import logger from "../Utils/historico.js";
//Toma el mensaje enviado por la IA para generar el reclamo 
//UTILIZADO EN flowInicio.js
function tomarDatosReclamo(mensaje) {

    try {
        // Divide el mensaje en líneas
        const lineas = mensaje.split('\n').map(linea => linea.trim());
    
        // Filtra las líneas que contienen ':'
        const reclamo = lineas
            .filter(linea => linea.includes(':'))
            .map(linea => {
                // Divide cada línea en clave y valor
                const [clave, valor] = linea.split(':').map(d => d.trim());
                return [clave.replace(/\*/g, '').replace(/^-/, '').trim(), valor.replace(/\*/g, '').trim()]; // Elimina '*' y '-' de la clave del valor
            });
    
        // Convierte el array de pares clave-valor en un objeto
        const reclamoObjetos = reclamo.reduce((obj, [clave, valor]) => {
            obj[clave[0]+clave[1]] = valor;
            return obj;
        }, {});

        reclamoObjetos['Eq'].toLowerCase().includes('otros') ? reclamoObjetos['Eq'] = 'Ascensor' : reclamoObjetos['Eq']
    
        return reclamoObjetos;
    } catch (error) {
        logger.error('Error en tomarDatosReclamo:', error);
    }
}

export default tomarDatosReclamo;