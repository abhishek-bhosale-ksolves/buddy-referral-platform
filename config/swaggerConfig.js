const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Referral API",
      version: "1.0.0",
      description: "API for managing referrals",
    },
    tags: [
      {
        name: "Users",
        description: "Operations related to users", // Users tag comes first
      },
      {
        name: "Referrals",
        description: "Operations related to referrals", // Referrals tag comes second
      },
    ],
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
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
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;
