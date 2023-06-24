import express from "express";
import { authPolicies, authToken } from "../../utils/jwt.js";
import { getChatPage } from "../controllers/aa";

const Router = express.Router();

Router.get("/", authToken, authPolicies("USER"), getChatPage);

export default Router;
