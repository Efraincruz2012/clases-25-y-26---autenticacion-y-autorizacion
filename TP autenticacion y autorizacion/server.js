const express = require('express')
const path = require('path')
const bcrypt = require ('bcrypt')

/******************  JWT  ******************/

const jwt = require("jsonwebtoken");

const PRIVATE_KEY = "myprivatekey";

function generateToken(user) {
  const token = jwt.sign({ data: user }, PRIVATE_KEY, { expiresIn: '24h' });
  return token;
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'not authenticated'
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'not authorized'
      });
    }

    req.user = decoded.data;
    next();
  });
};


/******************  SERVER  ******************/

const app = express()

app.use(express.urlencoded({ extended: true }))

/******************  STATIC FILES  ******************/

app.use(express.static('public'))

/******************  VIEWS  ******************/

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs');


/******************  MIDDLEWARES  ******************/

app.use(express.json())

/******************  MODELS  ******************/

const UserModel = require('./models/User.js');

/******************  ROUTES  ******************/

// REGISTER
app.post('/register', async (req, res) => {

  const { nombre, password, email } = req.body

  const usuarios = await UserModel.find()
          .then((docs) => {
            return docs;
          });
  
  const usuario = usuarios.find(usuario => usuario.nombre == nombre)
  if (usuario) {
    return res.json({ error: 'ya existe ese usuario' });
  }

  const saltRounds = 10;
  let passwordCodificado = '';
  
  let nuevoUsuario;

  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, async function(err, hash) {
      // Store hash in database here
      passwordCodificado = hash;
      
      nuevoUsuario = { nombre, password: passwordCodificado, email }
      
      const doc = new UserModel(nuevoUsuario);
      await doc.save();
    });
  });
      
  const access_token = generateToken(nuevoUsuario)

  res.render('index', {token: access_token, nombre });
})

app.get('/registro', (req, res) => {
  res.render('registro');
});

app.get('/', (req, res) => {
  res.render('index', {nombre: '' });
});

// LOGIN
app.post('/login', async (req, res) => {

  const { nombre, password } = req.body

  const usuarios = await UserModel.find()
    .then((docs) => {
      return docs;
    });

  const usuario = usuarios.find(usuario => usuario.nombre === nombre);

  if (!usuario) {
    return res.render('error', { error: 'usuario no existe' });
  }
  
  let samePassword = await new Promise((resolve, reject) => {

    bcrypt.compare(password, usuario.password, function(err, result) {
      if (err) reject(err)
      resolve(result)
    });
  
  });

  if (!samePassword) {
    return res.render('error', { error: 'credenciales invalidas' });
  }

  const access_token = generateToken(usuario)

  res.render('index', {token: access_token, nombre: usuario.nombre})
})

app.get('/login', (req, res) => {

  res.render('login');

});

app.get('/logout', (req, res) => {
  res.redirect('/login')
})

// DATOS
app.get('/datos', auth, (req, res) => {
  const usuario = usuarios.find(usuario => usuario.nombre == req.user.nombre);
  res.json(usuario)
})

/******************  LISTEN  ******************/

const PORT = 8080
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
server.on("error", error => console.log(`Error en servidor: ${error}`))