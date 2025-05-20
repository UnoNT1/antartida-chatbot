import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dirPrompts = (nombreEmp, num) => path.resolve(__dirname, `../openai/prompt${nombreEmp}${num}.txt`)

async function getPrompt(empresa, num) {
    const dirPrompt = dirPrompts(empresa, num)
    
    return new Promise((resolve, reject) => {
        fs.readFile(dirPrompt, 'utf-8', (err, prompt) => {
            if (err) reject(err);
            resolve(prompt);
        });
    });
}

export default getPrompt