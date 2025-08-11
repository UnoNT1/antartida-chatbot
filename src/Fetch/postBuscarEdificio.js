

async function postBuscarEdificio(direccion){
    let dir = {
        dir: direccion
    }
    console.log('---------direccion en postBuscarEdificio', dir)
    try{
        const response = await fetch('http://sd-1810521-h00001.ferozo.net/sistemas/dato5/android/buscarEdificio.php',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dir)
        });
        if (!response.ok) {
            throw new Error('Error en el request a la red: ' + response.statusText);
        }
        let dirObtenida = await response.json();
        if(dirObtenida.success === true){
            return dirObtenida.data; // Devuelve los datos del edificio
        }
    }catch (error) {
        console.error('Error en postBuscarEdificio:', error);
        throw error; // Propaga el error para manejarlo en el flujo
    }
}

export default postBuscarEdificio;