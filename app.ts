const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

// Import the routes
import fileRoutes from "./routes/fileRoutes";

// MongoDB connection string - replace with your actual connection string
const mongoURI =
  "mongodb+srv://olivtheolive:i8AWl6OIjdfjdBny@cluster0.nju1mlw.mongodb.net/";

// Create a new MongoClient
const client = new MongoClient(mongoURI);

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
    await client.connect(); // Connect to the MongoDB client
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit process with error
  }
}

startServer(); // Start the server with MongoDB connection
