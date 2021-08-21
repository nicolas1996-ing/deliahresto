module.exports.swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Deliah Rest API',
        version: '1.0.0',
        description: 'Documentación escrita para el proyecto deliah resto que contiene todos los endpoints usados',
        license: {
            name: 'MIT',
            url: ''
        },
        servers: [
            {
                url: 'http://localhost:3000/',
            },
            {
                url: 'http://deliahresto/',
            }
        ]
    }
}