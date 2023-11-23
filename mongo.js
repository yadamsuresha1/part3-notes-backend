const mongoose = require("mongoose");
if (process.argv.length < 2) {
  console.log("Please send password from command line");
  process.exit(1);
}
const password = process.argv[2];
const url = `mongodb+srv://fullstacknotes:${password}@cluster0.vb4raga.mongodb.net/person?retryWrites=true&w=majority`;
const name = process.argv[3];
const number = process.argv[4];

mongoose.set("strictQuery", false);
mongoose.connect(url);
const PersonSchema = new mongoose.Schema({
  name: String,
  number: Number,
});
const Person = mongoose.model("person", PersonSchema);
const person = new Person({
  name: name,
  number: number,
});

if (name) {
  person.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((persons) => {
    console.log("phonebook:");
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
      mongoose.connection.close();
    });
  });
}
