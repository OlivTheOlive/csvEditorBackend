const express = require("express"); // Express.js framework for building web applications and APIs
const multer = require("multer"); // Middleware for handling file uploads
const fs = require("fs"); // Node.js file system module for reading and writing files
const Papa = require("papaparse"); // Library for parsing CSV data
const cors = require("cors"); // Middleware for enabling Cross-Origin Resource Sharing (CORS)

const app = express(); // Create an instance of the Express application
const port = 3030;

// allow CORS --> allowing requests from any origin to access the server
app.use(cors());

// set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

// DTO class
class CsvDataDTO {
  // constructor that initializes the DTO with the given data
  constructor(data) {
    // Check if the data is already an array
    // if data is an array, use it directly
    // if data is not an array (e.g., an object), convert it to an array of values
    this.data = Array.isArray(data) ? data : Object.values(data);
  }
  // Getter for the data property
  get data() {
    // Return the internal _data property
    return this._data;
  }

  // Setter for the data property with validation
  set data(newData) {
    // Validate that the new data is an array
    if (Array.isArray(newData)) {
      // If valid, update the internal _data property
      this._data = newData;
    } else {
      throw new Error("Data must be an array");
    }
  }
}

// handle file upload
app.post("/upload", upload.single("csvFile"), (req, res) => {
  // read the uploaded file
  console.log("Received file upload request");
  const csvFilePath = req.file.path;
  console.log("Uploaded file path:", csvFilePath);

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

      // Limit the data to the first 200 entries
      data = data.slice(0, 200);

      // Create the DTO with the parsed data
      const csvDataDTO = new CsvDataDTO(data);

      // send processed data back to client
      res.json(csvDataDTO);
      console.log("Response sent to client");
    },
  });
});

// start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
