const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const url = process.env.MONGODB_URI;

console.log("Connecting to mongoose db!");
mongoose
  .connect(url)
  .then((response) => {
    console.log("connected to mongoose database!");
  })
  .catch((err) => {
    console.log("Error connecting to mongoose!", err);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("person", personSchema);
