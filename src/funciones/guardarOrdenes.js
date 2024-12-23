import postRevisarOrden from "../Fetch/postRevisarOrden.js"

let ordenes = [
]

async function guardarOrdenes(numOrden){
    try{
        const ordenCompleta = await postRevisarOrden(numOrden, 0)
        
        if(ordenes.length === 0){
            ordenes = [ordenCompleta[0]]
        }else {
            ordenes = [...ordenes, ordenCompleta[0]]
        } 
        console.log('Ordenes guardadas: ', ordenes) 
        return ordenes
    } catch (err){
        console.error('error al guardar orden: ', err)
        throw err
    }
}

const getOrdenes = () => {
    return ordenes
}

export { guardarOrdenes, getOrdenes }