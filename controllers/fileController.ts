import { Request, Response } from "express";
import { CsvDataDTO } from "../models/csvModel";
import { CsvModel } from "../models/newCSVModel";
import path from "path";
const fs = require("fs");
const Papa = require("papaparse");

// for readibility
interface CsvRowWithId {
  id: number;
}

/**
 * Handle inital file minipulation data received from client.
 * @param req Express Request object.
 * @param res Express Response object.
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    console.log("Received file upload request");
    const csvFilePath = req.file?.path;
    const originalFileName = req.file?.originalname; // Get the original file name
    console.log("Uploaded file path:", csvFilePath);
    console.log("Original file name:", originalFileName);

    if (!csvFilePath) {
      return res.status(400).send("No file uploaded.");
    }

    // Parse CSV file
    const fileStream = fs.createReadStream(csvFilePath);
    Papa.parse(fileStream, {
      header: true,
      dynamicTyping: true,
      transform: (value: any, column: string) => {
        if (
          column === "AADT" ||
          column === "85PCT" ||
          column === "PRIORITY_POINTS"
        ) {
          return undefined; // Remove these columns
        }
        return value;
      },
      complete: async (result: any) => {
        console.log("CSV parsing complete");
        let data = result.data;

        // Add incremental IDs to rows for better handling
        let dataWithIds = data.map((row: any, index: any) => {
          return { id: index + 1, ...row };
        });

        dataWithIds = dataWithIds.slice(0, 100); // Limit to 100 rows

        // Create a single document with the entire data and file name
        const singleDocument = { records: dataWithIds, name: originalFileName };

        try {
          // Insert the single document
          const insertedDocument = await CsvModel.create(singleDocument);
          console.log("Data inserted successfully");

          // Retrieve the document with its ID
          const documentId = insertedDocument._id;
          const document = await CsvModel.findById(documentId);

          if (!document) {
            throw new Error("Document not found");
          }

          // Create CsvDataDTO and send response
          const csvDataDTO = new CsvDataDTO(document.records);
          res.json({
            id: documentId,
            data: csvDataDTO.data,
            name: document.name,
          });
          console.log("Response sent to client");
        } catch (error: any) {
          console.error("Error inserting data into MongoDB:", error);
          return res.status(500).send("Failed to save data to MongoDB");
        }

        // Clean up the temporary file
        fs.unlink(csvFilePath, (err: any) => {
          if (err) {
            console.error("Failed to delete temporary file:", err);
          } else {
            console.log("Temporary file deleted");
          }
        });
      },
      error: (parseError: any) => {
        console.error("Error parsing CSV:", parseError);
        res.status(500).send("Error parsing CSV file");
      },
    });
  } catch (error: any) {
    console.error("Error in uploadFile:", error);
    res.status(500).send("Internal server error");
  }
};
/**
 * Handle saving data received from client as a CSV file and respond with CsvDataDTO.
 * @param req Express Request object.
 * @param res Express Response object.
 */
export const saveFile = async (req: Request, res: Response): Promise<void> => {
  const { data, id } = req.body; // Extract data and id from the request body

  if (!Array.isArray(data)) {
    res.status(400).send("Invalid data format: data should be an array");
    return;
  }

  try {
    // Convert data to CSV format using PapaParse
    const csv = Papa.unparse(data, {
      header: true, // First row is treated as header
    });

    // Define the directory and file path
    const tempDir = path.join(__dirname, "../temp");
    const filePath = path.join(tempDir, "data.csv");

    // Ensure the directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("Temporary directory created");
    }

    // Write CSV data to the file
    fs.writeFileSync(filePath, csv, { encoding: "utf-8" });

    // Update the document in MongoDB
    await CsvModel.findByIdAndUpdate(id, { records: data }, { new: true });

    // Send the CSV file as a download
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      } else {
        console.log("File sent successfully");
        // Delete the temporary file
        fs.unlinkSync(filePath);
      }
    });
  } catch (error: any) {
    console.error("Error saving data as CSV:", error);
    res.status(500).send("Internal server error");
  }
};
