const express = require("express");
const cors = require("cors");
const uploadRoute = require("./Routes/uploadRoute");

const app = express();
const port = 3030;

// Allow CORS
app.use(cors());

// Use the upload routes
app.use("/", uploadRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
