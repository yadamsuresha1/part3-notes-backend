const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});
app.get("/info", (req, res) => {
  const peopleCount = persons.length;
  res.send(
    `<p>Phonebook has info for ${peopleCount} people<br/><br/>${new Date()}</p>`
  );
});
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.send(person);
  } else {
    res.statusMessage = `No person with id ${id} found`;
    res.status(400).end();
  }
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
  const person = persons.find((person) => person.name === body.name);
  if (person) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }
  if (!body.number) {
    return res.status(400).json({
      error: "number is mandatory",
    });
  }
  const newPerson = {
    name: body.name,
    number: body.number,
    id: getNewId(),
  };
  persons = persons.concat(newPerson);
  res.json(newPerson);
});
const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: "unknown endpoint",
  });
};
app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
