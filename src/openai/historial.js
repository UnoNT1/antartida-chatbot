import fs from 'fs/promises';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()
const openAI = new OpenAI({ apiKey: process.env.API_KEY_ASCENSORES })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const archivoContexto = (number) => path.resolve(__dirname, `./contextoGPT${number}.json`);

async function guardarContexto(contexto, number) {
    try {
        //busca el contexto
        const archContexto = archivoContexto(number)
        await fs.writeFile(archContexto, JSON.stringify(contexto, null, 2));
    } catch (error) {
        console.error('Error al guardar el contexto:', error);
    }
}

async function cargarContexto(number) {
    try {
        //busca el contexto
        const contexto = archivoContexto(number)
        const data = await fs.readFile(contexto, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Si el archivo no existe, inicializar un nuevo contexto
            return [];
        }
        console.error('Error al cargar el contexto:', error);
        return [];
    }
}

async function mensajeChatGPT(body, prompt, number) {
    try {
        // Cargar el contexto actual
        const contexto = await cargarContexto(number);
        // Agregar el nuevo mensaje del usuario al contexto
        // console.log(contexto, 'contexto')
        contexto.push({ role: "user", content: body });

        const completion = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: prompt },
                ...contexto
            ],
            max_tokens: 200,
            temperature: 0.5,
        });

        const respuestaGPT = completion.choices[0].message.content;

        // Agregar la respuesta de GPT al contexto
        contexto.push({ role: "system", content: respuestaGPT });

        // Guardar el contexto actualizado
        await guardarContexto(contexto, number);
        //console.log("historial.js -> guardarContexto(contexto)", contexto)

        return respuestaGPT;
    } catch (err) {
        console.error("Error al obtener la respuesta de OpenAI:", err);
    }
}

async function finalizarConversacion(number) {
    try {
        const contexto = archivoContexto(number)
        await fs.writeFile(contexto, JSON.stringify([], null));
        await fs.unlink(contexto, (err) => {
            if (err) {
                console.error('Error al borrar el archivo:', err);
                return;
            }
            console.log('Archivo borrado exitosamente');
        });
        console.log('La conversación se ha reiniciado.');
    } catch (error) {
        console.error('Error al reiniciar la conversación:', error);
    }
}

export { mensajeChatGPT, finalizarConversacion, cargarContexto, guardarContexto }
