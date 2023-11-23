require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
//express above is a function
const app = express();
app.use(cors());
//below is used to parse the body correctly while getting data from the body
app.use(express.json());
app.use(express.static("dist"));
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] :body - :req[content-length]"
  )
);
const requestLogger = (req, res, next) => {
  console.log("Method", req.method);
  console.log("Path", req.path);
  console.log("Body", req.body);
  console.log("---");
  next();
};
app.use(requestLogger);

let persons = [];

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});
app.get("/info", (req, res) => {
  const peopleCount = persons.length;
  res.send(
    `<p>Phonebook has info for ${peopleCount} people<br/><br/>${new Date()}</p>`
  );
});
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      res.statusMessage = err;
      res.status(400).end();
    });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  console.log("persons", persons);
  res.statusMessage = `Person with id ${id} deleted successfully!`;
  res.status(204).end();
});

const getNewId = () => {
  return Math.floor(Math.random() * 100000);
};
app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({
      error: "name is mandatory",
    });
  }
  if (!body.number) {
    return res.status(400).json({
      error: "number is mandatory",
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((newPerson) => {
      res.json(newPerson);
    })
    .catch((err) => {
      res.statusMessage = err;
      res.status(400).end();
    });
});
const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: "unknown endpoint",
  });
};
app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
