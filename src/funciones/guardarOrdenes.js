import postRevisarOrden from "../Fetch/postRevisarOrden.js"

let ordenes = [
    {
        reg_cl12: 37635,
        r00_cl12: 0,
        tre_cl12: '5493513898408',
        fec_cl12: '2024-12-23',
        hor_cl12: '09:37'
    },
    {
      reg_cl12: 37638,
      r00_cl12: 0,
      tre_cl12: '5493513898408',
      fec_cl12: '2024-12-23',
      hor_cl12: '09:51'
    },
    {
      reg_cl12: 37640,
      r00_cl12: 0,
      tre_cl12: '5493513898408',
      fec_cl12: '2024-12-23',
      hor_cl12: '09:59'
    }
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