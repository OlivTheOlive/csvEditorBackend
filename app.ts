const express = require("express");
const cors = require("cors");
import mongoose from "mongoose";
import fileRoutes from "./routes/fileRoutes";
import { CsvModel } from "./models/newCSVModel";

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
    process.exit(1);
  }
}
startServer(); // Start the server with MongoDB connection
