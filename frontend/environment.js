let production = true;

// const server = production ? "https://livehorizon.onrender.com" : "http://localhost:8080";
const server = production ? "http://ec2-3-110-176-116.ap-south-1.compute.amazonaws.com:8080" : "http://localhost:8080";
export default server

