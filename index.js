const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const dotenv = require("dotenv");

dotenv.config();

const { API_PORT } = process.env.PORT;
const port = process.env.PORT || API_PORT;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
