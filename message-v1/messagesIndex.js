require("dotenv").config();
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const {
  Validator,
  ValidationError
} = require("express-json-validator-middleware");

const kue = require("kue");
let queue = kue.createQueue({
  redis: {
    host: "redis"
  }
});
module.exports = queue;

const getMessages = require("./src/controllers/getMessages");
const getMessageStatusById = require("./src/controllers/getMessageStatusById");
const { getHostName, getApiVersion } = require("./src/utils");
const app = express();

const validator = new Validator({ allErrors: true });
const { validate } = validator;

const messageSchema = {
  type: "object",
  required: ["destination", "body"],
  properties: {
    destination: {
      type: "string"
    },
    body: {
      type: "string"
    },
    location: {
      name: {
        type: "string"
      },
      cost: {
        type: "number"
      }
    }
  }
};

require("./src/queue/consumers/sendConsumer");
require("./src/queue/enqueuers/enqueueRollBack");
const enqueue = require("./src/queue/enqueuers/enqueueCheckBalance");

//End Points
app.post(
  "/messages",
  bodyParser.json(),
  validate({ body: messageSchema }),
  enqueue
);

app.get("/messages/:id/status", getMessageStatusById);

app.get("/messages", getMessages);

app.get("/hostname", getHostName);

app.get("/version", getApiVersion);

app.use(function(err, req, res, next) {
  console.log(res.body);
  if (err instanceof ValidationError) {
    res.sendStatus(400);
  } else {
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT, function() {
  console.log("Message App started on PORT 9007");
});
