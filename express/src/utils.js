import {fileURLToPath} from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt' // importamos bcrypt Se coloca acá para poderle dar mantenimiento

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("import.meta.url: ",import.meta.url)
console.log("__filename: ", __filename)
console.log("__dirname: ", __dirname)

export default __dirname;


//****** Configuracion de bcrypt******/
export const creaHash = (password)=>bcrypt.hashSync(password, bcrypt.genSaltSync(10))//Palabras aleatorias que genera. tiene return implicito

export const validaPassword = (usuario, password)=>bcrypt.compareSync(password, usuario.password) 


//***End ***** Configuracion de bcrypt******/