const express = require('express');
const helmet = require('helmet');
const bodyparser = require('body-parser');

const userRouter = require('./routes/users');
const orderRouter = require('./routes/orders');
const authRouter = require('./routes/auth');

const server = express();
server.use(bodyparser.json());
server.use(helmet());

server.use('/', userRouter);
server.use('/', orderRouter);
server.use('/', authRouter);

const port = 3000;

server.get('/', (req, res)=> {
    res.send('Bienvenido');
});

server.listen(port, ()=> {
    console.log(`Servidor corriendo en el puerto ${port}`);
});