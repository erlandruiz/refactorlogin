import passport from "passport"; //importamos el middleware passport es el core
import local from "passport-local"; // importamos la estrategia username, password
import { usuariosModelo } from "../dao/models/usuarios.modelo.js";
import { creaHash, validaPassword } from "../utils.js";
//PASO 1 Y PASO 1.1 configurado

import github from 'passport-github2' //importamos passport-github2 para trabajar con github

export const inicializarPassport = () => {
  //todas las estrategias se implemetan con un middleware.

  //registro es el nombre de la estrategia TODAS las estrategias se configuran con passport.use
  passport.use( //llamado PASO 1
    "registro",
    new local.Strategy( //es una estrategia local
      {
        //primero es un objeteo literal
        passReqToCallback: true, //Pasar la req al callback
        usernameField: 'email'  // establecemos la data de email en username
      },
      async (req, username, password, done) => { //colocamos la req para poderla llamar
        // el segundo es una funcion de flecha, aqui se coloca la logica del registro
        //si o si hay tres agurmentos username, passwor, done

        try { //aca copiamos todo lo que esta en la session.router.js /registro

          console.log("Estrategia local resgitro de Passport...!!!")

        //   let { nombre, email, password } = req.body;
          let { nombre, email} = req.body;  //dejame el email para no cambiar todos los campos por username
        //   console.log(nombre, email, password);

          if (!nombre || !email || !password) {
            // return res.redirect("/registro?error=Complete todos los datos");
            return done (null, false)// null porque no hay error y false porque no hay usuario
          }

          let regMail =
            /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
          // console.log(regMail.test(email))
          if (!regMail.test(email)) {
            // return res.redirect(
            //   "/registro?error=Mail con formato incorrecto...!!!"
            // );
            
            return done (null, false)// null porque no hay error y false porque no hay usuario

          }

          let existe = await usuariosModelo.findOne({ email: email });
          if (existe) {
            // return res.redirect(
            //   `/registro?error=Existen usuarios con email ${email} en la BD`
            // );

            return done (null, false)// null porque no hay error y false porque no hay usuario
          }

          // password = crypto.createHmac("sha256","codercoder123").update(password).digest("hex"); // quitamos lo de cryto para trabajar con bcrypt
          password = creaHash(password);

          // console.log(password) // cambio de formato
          let usuario;

          //**Comprobamos si es administrador para darle su rol *****/

          try {
            const isAdmin =
              req.body.email == "adminCoder@coder.com" &&
              req.body.password == "adminCod3r123";

            //   console.log('isAdmin:', isAdmin);

            const rol = isAdmin ? "administrador" : "usuario";

            usuario = await usuariosModelo.create({
              nombre,
              email,
              password,
              rol,
            });

            // res.redirect(
            //   `/login?mensaje=Usuario ${email} registrado correctamente`
            // );

            return done (null, usuario)// null porque no hay error y usuario porque si hay usuario
              // previo a devolver un usuario con done, passport graba en la req, una propiedad
                    // user, con los datos del usuario. Luego podré hacer req.user
          } catch (error) {
            // res.redirect(
            //   "/registro?error=Error inesperado. Reintente en unos minutos"
            // );
            return done (null, false)// null porque no hay error y false porque no hay usuario
          }
          //**End***Comprobamos si administrador para darle su rol *****/
        } catch (error) {
          return done(error); //primera posicion es el error, segunda poscion es el usuario
          // done(error, null ) //esto es lo miso que done(error)
        }
      }
    )
  );

  passport.use( "login", new local.Strategy(
    {
      usernameField: 'email'  // establecemos la data de email en username
    },
    async(username, password, done)=>{
      try {
        // let { email, password } = req.body; //esta linea ya no se toma

        // if (!email || !password) {
        if (!username|| !password) { //reemplazamos a email por username 
          // return res.redirect("/login?error=Complete todos los datos");
          return done(null, false) // no hay error y no hay usuario
        }
        // password = crypto //Reemplazamos el cryto por bcrypt
        //   .createHmac("sha256","codercoder123")
        //   .update(password)
        //   .digest("hex");
      
        // let usuario = await usuariosModelo.findOne({ 
        //   email: email,
        //   password: password,
        // });
      
        let usuario = await usuariosModelo.findOne({// se modifica tambien y se busca solo por email
          email: username // aca colocamos el username que viene a ser el email
        }).lean(); //** si o si ponerle el lean()**/
        if (!usuario) {
          // return res.redirect(`/login?error=credemciales incorrectas`);
          return done(null, false) // no hay error y no hay usuario
        }
        if (!validaPassword(usuario, password)) { //se modifica y trabaja con validaPassword
          // return res.redirect(`/login?error=credemciales incorrectas`);
          return done(null, false) // no hay error y no hay usuario
        }

        //** ojo si o si debemos de no mostrar el password ademas debemos de colocarle siempre el lean() al realizar las busquedas */

        console.log(Object.keys(usuario)) // para ver como viene los datos hidratados
        delete usuario.password;

        return done(null, usuario)
        // previo a devolver un usuario con done, passport graba en la req, una propiedad
                    // user, con los datos del usuario. Luego podré hacer req.user
        
      } catch (error) {
        return done(error, null)
      }
    }
  ))

  passport.use('github', new github.Strategy( // implementamos la autenticacion con GITHUB
    {//objeto literal para pasar configuraciones

      clientID:"",
      clientSecret: "",
      callbackURL:"" 
      

    },
    async ( accessToken,refreshToken, profile  ,done)=>{// Solo usaremos el profile y el done
      try {
        // console.log(profile)

        let usuario = await usuariosModelo.findOne({email: profile._json.email})

        if (!usuario) {
          let nuevoUsuario = {
            nombre: profile._json.name,
            email: profile._json.email,
            profile  // guardamos directamente el profile para ello colocamos el strick en false en usuarios.modelo.js
          }

          usuario = await usuariosModelo.create(nuevoUsuario)
        }


        return done(null, usuario)
        
      } catch (error) {
        return done(error, null)
      }
    }
  ))


   //configurar serializador y deserializador (PASO 1'(prima))
    // debemos de tener esto en un machetito

    passport.serializeUser((usuario, done)=>{
      return done(null, usuario._id) //se le envio el usuario._id porque lo podemos recuperar de la base de datos
  })

  passport.deserializeUser(async(id, done)=>{ //ejecutamos si o si una funcion asincrona
      let usuario = await usuariosModelo.findById(id)
      return done(null, usuario)
  })
}; // fin inicializarPassport
