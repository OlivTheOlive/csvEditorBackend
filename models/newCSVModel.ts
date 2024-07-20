import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Define the schema for CSV records
const csvSchema = new Schema(
  {
    records: [
      {
        type: Map,
        of: Schema.Types.Mixed, // Use a map to handle dynamic keys and mixed types
      },
    ],
    name: {
      type: String, // Assuming 'name' is a single string. Change to [String] if it's an array of strings
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export const CsvModel = mongoose.model("CsvData", csvSchema);
