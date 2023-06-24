import swaggerJSDoc from "swagger-jsdoc";
import __dirname from "./utils.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentacion",
      description:
        "Documentacion del ecommerce para el curso de backend en coderhouse",
    },
  },
  apis: [`${__dirname}/./docs/**/*.yaml`],
};

const initSwagger = () => {
  const specs = swaggerJSDoc(swaggerOptions);
  return specs;
};

export default initSwagger;