import express from "express";
import dotenv from "dotenv";
import handlebars from "express-handlebars";
import passport from "passport";
import cookieParser from "cookie-parser";
import __dirname, { MongoStoreInstance } from "./utils.js";
import session from "express-session";
import productsRouter from "./products/routes/products.routes.js";
import cartRouter from "./carts/routes/carts.routes.js";
import userRouter from "./users/routes/users.routes.js";
import viewsRouter from "./client/routes/views.routes.js";
import chatRouter from "./messages/routes/messages.router.js";
import initializePassport from "./config/passport.config.js";
import sessionRouter from "./users/routes/sessions.routes.js";
import productsMockRouter from "./mocks/routes/productsMock.routes.js";
import loggerRouter from "./logger/routes/logger.router.js";
import apiUserRouter from "./users/routes/apiUser.routes.js"
import MongoConnection from "./mongo.js";
import { Server } from "socket.io";
import socket from "./socket.js";
import { errorHandler } from "./middlewares/errors/index.js";
import { addLogger } from "./utils/logger.js";

//const and env variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//init mongoDB
MongoConnection.getInstance();

//passport
initializePassport();

//handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//middlewares
app.use(session(MongoStoreInstance));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(errorHandler);
app.use(addLogger);

//routers
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/users", apiUserRouter)
app.use("/", userRouter);
app.use("/", viewsRouter);
app.use("/chat", chatRouter);
app.use("/", productsMockRouter);
app.use("/loggerTest", loggerRouter);

//app.listen
const httpServer = app.listen(PORT, () => {
  console.log("Server up!");
});

//socket
const io = new Server(httpServer);
socket(io);