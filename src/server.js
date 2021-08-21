const express = require('express');
const helmet = require('helmet');
const bodyparser = require('body-parser');

const swaggerJSdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const userRouter = require('./routes/users');
const orderRouter = require('./routes/orders');
const productRouter = require('./routes/products');
const authRouter = require('./routes/auth');

const server = express();
server.use(bodyparser.json());
server.use(helmet());

const port = 4000;
const swaggerDefinition = require('./swaggerDefintion.js');
const options = {
    ...swaggerDefinition,
    apis: ['./src/routes/*.js']
}
const swaggerSpec = swaggerJSdoc(options)

server.use('/', userRouter);
server.use('/', orderRouter);
server.use('/', authRouter);
server.use('/', productRouter);
server.use('/docs/swaggerDefinition', swaggerUI.serve, swaggerUI.setup(swaggerSpec));


server.get('/', (req, res) => {
    res.send('Bienvenido');
});

// endpoint para imprimir documentación 
server.get('/api-docs.json', (req, res) => {
    res.send(swaggerSpec);
});

server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});