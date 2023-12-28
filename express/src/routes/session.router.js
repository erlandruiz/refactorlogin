import { Router } from "express";
import { usuariosModelo } from "../dao/models/usuarios.modelo.js";

import crypto from "crypto"; // traemos a crypto para la contraseña
import { error } from "console";
import { creaHash, validaPassword } from "../utils.js"; //trae el crea hash de utils.js

import passport from "passport";//PASO 3
export const router = Router();

router.get('/errorLogin',(req,res)=>{
  return res.redirect("/login?error=Error en el proceso de login...  :(");
})

router.post("/login",passport.authenticate('login', {failureRedirect:'/api/sessions/errorLogin'}), async (req, res) => {

    //***Esto se ha comentado porque todo fue copiado al config.passport.js */
  // let { email, password } = req.body;

  // if (!email || !password) {
  //   return res.redirect("/login?error=Complete todos los datos");
  // }
  // // password = crypto //Reemplazamos el cryto por bcrypt
  // //   .createHmac("sha256","codercoder123")
  // //   .update(password)
  // //   .digest("hex");

  // // let usuario = await usuariosModelo.findOne({ 
  // //   email: email,
  // //   password: password,
  // // });

  // let usuario = await usuariosModelo.findOne({// se modifica tambien y se busca solo por email
  //   email: email
  // });
  // // if (!usuario) {
  // //   return res.redirect(`/login?error=credemciales incorrectas`);
  // // }
  // if (!validaPassword(usuario, password)) { //se modifica y trabaja con validaPassword
  //   return res.redirect(`/login?error=credemciales incorrectas`);
  // }

  //Una vez que ya sabemos que el se ha validado creamos la session

  console.log(req.user)
  req.session.usuario = {
    //JAMAS SE DEBE DE ENVIAR PASSWORD, colocar el rol
    nombre: req.user.nombre, //cambiamos usuario por req.user
    email: req.user.email,//cambiamos usuario por req.user
    rol: req.user.rol, //COLCAMOS EL rol //cambiamos usuario por req.user
  };

  res.redirect("/perfil");
});

router.get("/errorRegistro",(req, res)=>{ //PASO3  passport
  return res.redirect("/registro?error=Error en el proceso de registro");
} )
//failureRedirect significa que redirecciona si falla
router.post("/registro", passport.authenticate('registro',{failureRedirect:'/api/sessions/errorRegistro'}),  async (req, res) => {
  let {email}=req.body //PASO3
  //***Esto se ha comentado porque todo fue copiado al config.passport.js */
  // let { nombre, email, password } = req.body;
  // console.log(nombre, email, password);

  // if (!nombre || !email || !password) {
  //   return res.redirect("/registro?error=Complete todos los datos");
  // }

  // let regMail =
  //   /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
  // // console.log(regMail.test(email))
  // if (!regMail.test(email)) {
  //   return res.redirect("/registro?error=Mail con formato incorrecto...!!!");
  // }

  // let existe = await usuariosModelo.findOne({ email: email });
  // if (existe) {
  //   return res.redirect(
  //     `/registro?error=Existen usuarios con email ${email} en la BD`
  //   );
  // }

  // // password = crypto.createHmac("sha256","codercoder123").update(password).digest("hex"); // quitamos lo de cryto para trabajar con bcrypt
  // password = creaHash(password)

  // // console.log(password) // cambio de formato
  // let usuario;

  // //**Comprobamos si es administrador para darle su rol *****/
  

  // try {
  //   const isAdmin =
  //     req.body.email == "adminCoder@coder.com" && req.body.password == "adminCod3r123";


  //   //   console.log('isAdmin:', isAdmin);
 
  //   const rol = isAdmin ? "administrador" : "usuario";




  //   usuario = await usuariosModelo.create({ nombre, email, password, rol });

  //   res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);

  // } catch (error) {
  //   res.redirect("/registro?error=Error inesperado. Reintente en unos minutos");
  // }
  // //**End***Comprobamos si administrador para darle su rol *****/

  res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);  //PASO3  passport
});

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.redirect("/login?error=fallo en el logout");
    }
  });

  res.redirect("/login");
});


//****session de github */

router.get('/github',passport.authenticate('github', {}),(req,res)=>{//colocamos passport.authenticate('github' el mismo nombre del passport.use que esta en config.passport.js con ese se asocia

}) 

router.get('/callbackGithub',passport.authenticate('github',{failureRedirect:"/api/sessions/errorGithub"}), (req,res)=>{

  console.log(req.user)
  req.session.usuario = req.user
    res.setHeader('Content-Type','application/json');
    res.status(200).json({// en base a la necesidad, ponemos lo que deseamos( si tenemos una lista redireccionaremos )
      message: "Acceso ok ...!!!", 
      usuario: req.user
    });
})

router.get('/errorGithub', (req,res)=>{
  res.setHeader('Content-Type','application/json');
  res.status(200).json({
    error: "Error al autenticar con Github"
  });
})


//**end **session de github */
