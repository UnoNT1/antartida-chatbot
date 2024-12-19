//Este metodo se llama en guardarOrdenes()
async function postRevisarOrden(numOrden, estado){
    const objOrden = { 'nroOrden': numOrden, 'estado': estado}

    try {
        const response = await fetch('http://localhost/backendChatBotAntartida/devolverOrden.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objOrden)
        });
        const resJson = await response.json()
        console.log('respuesta orden: ', resJson)

        return resJson
    } catch (err) {
        console.error('Error al buscar orden: ', err)
        throw err
    }
}

export default postRevisarOrden