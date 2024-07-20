const express = require("express");
const cors = require("cors");
import mongoose from "mongoose";
// Import the routes
import fileRoutes from "./routes/fileRoutes";
import { CsvModel } from "./models/newCSVModel";

// MongoDB connection string - replace with your actual connection string
const mongoURI =
  "mongodb+srv://olivtheolive:i8AWl6OIjdfjdBny@cluster0.nju1mlw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express(); // Create an instance of the Express application
const port = 3030;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/", fileRoutes);
app.use(express.static("public"));

// Function to connect to the database and start the server
async function startServer() {
  try {
    await mongoose.connect(mongoURI); // Connect to the MongoDB client
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit process with error
  }
}
// const testInsert = async () => {
//   try {
//     await mongoose.connect(mongoURI);

//     // Test data
//     const testData = [
//       {
//         ADT: 3039,
//         COUNTY: "HFX",
//         DESCRIPTION: "0.5 KM EAST OF BRUSHY HILL RD",
//         DIRECTION: null,
//         Date: "07/13/2023",
//         GROUP: "A",
//         HIGHWAY: 1,
//         PTRUCKS: null,
//         SECTION: 47,
//         "SECTION DESCRIPTION": "PATTON RD (SACKVILLE) TO MOUNT UNIACKE CONN",
//         "SECTION ID": 1047,
//         "SECTION LENGTH": 4.5,
//         TYPE: "TC",
//         id: 1,
//       },
//     ];

//     await CsvModel.insertMany(testData);
//     console.log("Data inserted successfully");
//   } catch (error) {
//     console.error("Error inserting data:", error);
//   } finally {
//     await mongoose.disconnect();
//   }
// };

// testInsert();
startServer(); // Start the server with MongoDB connection
