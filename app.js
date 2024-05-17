// external imports
const express = require("express");
const cors = require("cors");
const uploadRoute = require("./Routes/uploadRoute");

// internal imports
require("dotenv/config");
const API = process.env.API_URL;
const PORT = process.env.PORT;

const app = express();

// Allow CORS
app.use(cors());

// Use the upload routes
app.use(API, uploadRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
