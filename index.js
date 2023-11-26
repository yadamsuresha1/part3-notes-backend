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
  Person.estimatedDocumentCount().then((count) => {
    res.send(
      `<p>Phonebook has info for ${count} people<br/><br/>${new Date()}</p>`
    );
  });
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
  Person.findByIdAndDelete(req.params.id).then((result) => {
    res.status(204).end();
  });
});

app.post("/api/persons", (req, res, next) => {
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
    .save(person)
    .then((newPerson) => {
      res.json(newPerson);
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});
const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: "unknown endpoint",
  });
};
app.use(unknownEndpoint);
const errorHandler = (error, req, res, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
