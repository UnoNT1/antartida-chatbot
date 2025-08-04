//recibe como texto la respuesta del postAlBackend al enviar un mensaje y separa los numeros de los tecnicos en un array
//UTILIZADA EN postIniciarOrden.js
function separarNumTecnicos(data) {

    const jsonStart = data.indexOf('[');
    const jsonEnd = data.lastIndexOf(']') + 1;
    const jsonString = data.slice(jsonStart, jsonEnd);

    const subcadenas = jsonString.split('#')

    let resultado = subcadenas.filter(subcadena => subcadena !== '');
    resultado = resultado.filter(num => num.startsWith('035') || num.startsWith('351') || num.startsWith('378'))
    resultado= resultado.map(num => num.startsWith('3') ? '0' + num : num) //agrega un 0 al comienzo de los numeros que empiezan con 3
    
    return resultado
}

export default separarNumTecnicos