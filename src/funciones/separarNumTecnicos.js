//recibe como texto la respuesta del postAlBackend al enviar un mensaje y separa los numeros de los tecnicos en un array
function separarNumTecnicos(data) { 
    console.log(data)

    const jsonStart = data.indexOf('[');
    const jsonEnd = data.lastIndexOf(']') + 1;
    const jsonString = data.slice(jsonStart, jsonEnd);

    const subcadenas = jsonString.split('#')
    let resultado = subcadenas.filter(subcadena => subcadena !== '');
    resultado = resultado.filter(num => num.startsWith('035'))

    return resultado
}

export default separarNumTecnicos