//Este metodo se llama en enviarMsjAUsuario() en el backend ejecutando un post para cambiar el estado de la orden en la base de datos
async function postRevisarOrden(numOrden, estado) {
    const objOrden = { 'nroOrden': numOrden, 'estado': estado }

    try {
        const response = await fetch('https://sd-1810521-h00001.ferozo.net/devolverOrden_w.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objOrden)
        });
        const resJson = await response.json()
        console.log('Post Revisar Orden: ', resJson)

        return resJson
    } catch (err) {
        console.error('Error al buscar orden: ', err)
        throw err
    }
}

export default postRevisarOrden
