const express = require("express"); // Express.js framework for building web applications and APIs
const cors = require("cors"); // Middleware for enabling Cross-Origin Resource Sharing (CORS)
import fileRoutes from "./routes/fileRoutes";

const app = express(); // Create an instance of the Express application
const port = 3030;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/", fileRoutes);
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
