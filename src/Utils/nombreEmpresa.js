import fs from 'fs'

async function nombreEmpresa(){
    const empresa = await new Promise((resolve, reject) => {
        //lee el nombre de la empresa guardado en un archivo txt dentro de la carpeta Utils
        fs.readFile('./src/Utils/empresa.txt', 'utf8', (err, data)=> {
            if(err){
                reject(err)
                console.error('error al leer archivo', err)
                return
            } 
            resolve(data);
        })
    })
    return empresa
}

export default nombreEmpresa