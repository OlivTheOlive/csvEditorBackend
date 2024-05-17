const fs = require("fs");
const Papa = require("papaparse");

const parseCSV = (csvFilePath, callback) => {
  const fileStream = fs.createReadStream(csvFilePath);
  Papa.parse(fileStream, {
    header: true,
    dynamicTyping: true,
    complete: (result) => {
      callback(result.data);
    },
  });
};

module.exports = { parseCSV };
