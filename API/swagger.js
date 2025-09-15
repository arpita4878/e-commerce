import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "API documentation for the e-commerce backend",
    },
    servers: [
      {
        url: "http://localhost:5000",
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
      { bearerAuth: [] }
    ],
  },
  apis: ["./src/routes/*.js"], // scan all route files for JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
