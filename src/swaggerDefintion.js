module.exports.swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Deliah Resto API",
    version: "1.0.0",
    description:
      "Esta es una documentacion escrita para el proyecto deliah resto tiene todos los endpoints de la API",
    license: {
      name: "MIT",
      url: "",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/",
      description: "develop",
    },
    {
      url: "https://delahiaresto.com/",
      description: "production",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};
