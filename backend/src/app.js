import express from "express";
import {createServer} from "node:http"
import { Server } from "socket.io";
import mongoose, { mongo } from "mongoose";
import cors from "cors";
import { create } from "node:domain";
import { connectToSocket } from "./controller/serverController.js";
import userRoutes from "./routes/userRoutes.js"
import { checkTokenExpiry } from "./middlewares/tokenCheck.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8080);
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRoutes);


app.get("/home" , (req, res) => {
  return res.json({"Hello" : "world"});
})

const main = async () => {
  const db = await mongoose.connect("mongodb+srv://labh:KgH3wPZt4lSiDGmR@cluster0.3rdzb.mongodb.net/Cluster0")
}
main();

server.listen(8080, () => {
  console.log("Listening on port 8080");
})

