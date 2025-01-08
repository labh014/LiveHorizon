import express from "express";
import {createServer} from "node:http"
import { Server } from "socket.io";
import mongoose, { mongo } from "mongoose";
import cors from "cors";
import { create } from "node:domain";
import { connectToSocket } from "./controller/serverController.js";
import userRoutes from "./routes/userRoutes.js"
import { checkTokenExpiry } from "./middlewares/tokenCheck.js";
import { fileURLToPath } from "node:url";
import path from 'path';
import 'dotenv/config'; 
const PORT = process.env.PORT || 8080;



const app = express();
const server = createServer(app);
const io = connectToSocket(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set("port", process.env.PORT || 8080);
app.use(cors({
    origin: 'https://livehorizonfrontend.onrender.com'
}));


app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRoutes);

// // Serve static frontend files
// const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Serve static files from the frontend dist folder
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Catch-all route to serve index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
// // Catch-all route for React Router
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
// });


// Serve the React frontend for non-API routes
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve('frontend/dist/index.html'));
// });


app.get("/home" , (req, res) => {
  return res.json({"Hello" : "world"});
})

const main = async () => {
  const db = await mongoose.connect(process.env.DATABASE_URL)
  console.log("conection to database is succesfully")
}
main();

server.listen(PORT, () => {
  console.log(`Listening on port 8080 ${PORT}`);
})

