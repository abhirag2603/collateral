const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Simulate the offline mock mode code
function enableOfflineMockMode() {
  Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
  mongoose.connection.db = {
    collection: function(name) {
      return {
        find: () => {},
        findOne: () => {},
        updateOne: () => {},
        create: () => {}
      };
    }
  };

  const mockFind = function(query = {}) {
    return Promise.resolve([]);
  };

  const targets = [mongoose.Model, ...Object.values(mongoose.models)];
  targets.forEach((target) => {
    if (!target) return;
    target.find = mockFind;
  });
}

enableOfflineMockMode();

const FinancialDataSchema = new Schema({
  income: Number
});

console.log("Compiling model...");
try {
  const FinancialData = mongoose.model("FinancialData", FinancialDataSchema);
  console.log("Compiled successfully:", !!FinancialData);
  
  // Try calling find
  FinancialData.find().then((res) => {
    console.log("Find result:", res);
  });
} catch (err) {
  console.error("Error compiling:", err);
}
