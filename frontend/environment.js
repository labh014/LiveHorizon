let production = false;

const server = production ? "https://livehorizon.onrender.com" : "http://localhost:8080";
export const socketServer = production ? "https://livehorizon.onrender.com" : "http://localhost:8082";
export default server;