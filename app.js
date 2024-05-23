const express = require("express"); // Express.js framework for building web applications and APIs
const multer = require("multer"); // Middleware for handling file uploads
const fs = require("fs"); // Node.js file system module for reading and writing files
const Papa = require("papaparse"); // Library for parsing CSV data
const cors = require("cors"); // Middleware for enabling Cross-Origin Resource Sharing (CORS)

const app = express(); // Create an instance of the Express application
const port = 3033;

// Allow CORS --> allowing requests from any origin to access the server
app.use(cors());

// set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

// DTO class
class CsvDataDTO {
  // constructor that initializes the DTO with the given data
  constructor(data) {
    // check if the data is already an array
    // if data is an array, use it directly
    // if data is not an array (e.g., an object), convert it to an array of values
    this.data = Array.isArray(data) ? data : Object.values(data);
  }
  // getter for the data property
  get data() {
    // return the internal _data property
    return this._data;
  }
  // setter for the data property with validation
  set data(newData) {
    // validate that the new data is an array
    if (Array.isArray(newData)) {
      // if valid, update the internal _data property
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
  // parse CSV file asynchronously
  const fileStream = fs.createReadStream(csvFilePath);
  Papa.parse(fileStream, {
    header: true,
    dynamicTyping: true,
    complete: (result) => {
      console.log("CSV parsing complete");
      // process parsed data
      let data = result.data;
      console.log("Parsing data");

      // limit the data to the first 200 entries
      console.log("Slicing data to be a max 200 entries");
      data = data.slice(0, 200);

      // create the DTO with the parsed data
      const csvDataDTO = new CsvDataDTO(data);

      // send processed data back to client
      res.json(csvDataDTO);
      console.log("Response sent to client");

      // clean up the uploaded file after processing
      fs.unlink(csvFilePath, (err) => {
        if (err) {
          console.error("Failed to delete temporary file:", err);
        } else {
          console.log("Temporary file deleted");
        }
      });
    },
    error: (error) => {
      console.error("Error parsing CSV:", error);
      res.status(500).send("Error parsing CSV file");
    },
  });
});

// start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
