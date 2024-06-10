const express = require("express"); // Express.js framework for building web applications and APIs
const multer = require("multer"); // Middleware for handling file uploads
const fs = require("fs"); // Node.js file system module for reading and writing files
const Papa = require("papaparse"); // Library for parsing CSV data
const cors = require("cors"); // Middleware for enabling Cross-Origin Resource Sharing (CORS)
import { Request, Response } from 'express';
const app = express(); // Create an instance of the Express application
const port = 3033;


// Allow CORS --> allowing requests from any origin to access the server
app.use(cors());

// set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

// DTO class for encapsulating CSV data into a data transfer object
class CsvDataDTO {
  private _data:object;
  /**
   * Initializes the CsvDataDTO with the provided data.
   * If the data is not an array, it will be converted to an array of values.
   * @param {Array|Object} data - The data to be encapsulated in the DTO.
   */
  constructor(data:object) {
    this._data = Array.isArray(data) ? data : Object.values(data);
  }

  /**
   * Getter for accessing the encapsulated data.
   * @returns {Array} The encapsulated data stored in the DTO.
   */
  public get data() {
    return this._data;
  }

  /**
   * Setter for updating the encapsulated data with validation.
   * Throws an error if the new data is not an array.
   * @param {Array} newData - The new data to be set in the DTO.
   * @throws {TypeError} If the newData is not an array.
   */
  public set data(newData) {
    try {
      if (Array.isArray(newData)) {
        this._data = newData;
      } else {
        throw new TypeError("Data must be an array");
      }
    } catch (error:any) {
      console.error("Failed to set data:", error.message);
      throw error;
    }
  }
}
// handle file upload
app.post("/upload", upload.single("csvFile"), (req:Request, res:Response) => {
  // read the uploaded file
  console.log("Received file upload request");
  const csvFilePath = req.file?.path;
  console.log("Uploaded file path:", csvFilePath);
  // parse CSV file asynchronously
  const fileStream = fs.createReadStream(csvFilePath);
  Papa.parse(fileStream, {
    header: true,
    dynamicTyping: true,
    complete: (result:any) => {
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
      fs.unlink(csvFilePath, (err:any) => {
        if (err) {
          console.error("Failed to delete temporary file:", err);
        } else {
          console.log("Temporary file deleted");
        }
      });
    },
    error: (error:any) => {
      console.error("Error parsing CSV:", error);
      res.status(500).send("Error parsing CSV file");
    },
  });
});

// start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
