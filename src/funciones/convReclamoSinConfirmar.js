import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

//se utiliza en la funcion reclamoSinConfirmar()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const archivoContexto = (number) => path.resolve(__dirname, `../openai/contextoGPT${number}.json`);

async function copiaConv(numero){
    const contexto = archivoContexto(numero);
    let conversacion = []
            // Intenta leer el archivo de contexto
            try {
                conversacion = await fs.readFile(contexto, 'utf8');
                
                conversacion = JSON.parse(conversacion); // Parsea el contenido JSON
    
            } catch (error) {
                if (error.code === 'ENOENT') {
                    conversacion = null; // Si no existe, establece conversacion como null
                } else {
                    throw error; // Lanza otros errores
                }
            }
    return conversacion        
}

export default copiaConv