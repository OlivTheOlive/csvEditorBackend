const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Papa = require("papaparse");
const cors = require("cors");

const app = express();
const port = 3030;

// allow CORS --> allowing requests from any origin to access the server
app.use(cors());

// set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

// handle file upload
app.post("/upload", upload.single("csvFile"), (req, res) => {
  // read the uploaded file
  console.log("Received file upload request");
  const csvFilePath = req.file.path;
  console.log("Uploaded file path:", csvFilePath);
  const records = [];

  // parse CSV file
  const fileStream = fs.createReadStream(csvFilePath);
  Papa.parse(fileStream, {
    header: true,
    dynamicTyping: true,
    complete: (result) => {
      console.log("CSV parsing complete");
      // process parsed data
      const data = result.data;
      console.log("Parsing data");
      data.forEach((row) => {
        // process each row and create record object
        const record = {};
        records.push(record);
      });
      console.log("Processing records");
      // send processed data back to client
      res.json(records);
      console.log("Response sent to client");
    },
  });
});

// start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
