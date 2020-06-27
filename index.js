const http = require("http");
const express = require("express");
const { Server } = require("ws");

const PORT = process.env.PORT || 8000;
const app = express();

const server = http.createServer(app);

const wss = new Server({ server });

const rolls = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
};
let rollLog = [];

wss.on("connection", function (connection) {
  console.log(
    new Date() +
      " Recieved a new connection from origin " +
      Object.keys(connection) +
      "."
  );
  connection.send(
    JSON.stringify({
      type: "roll",
      rolls,
      lastRoll: rollLog[rollLog.length - 1],
    })
  );

  connection.on("message", (message) => {
    console.log("gotta message", message);
    const _message = JSON.parse(message);
    if (_message.type === "roll") {
      const { number } = _message;
      const currentValue = rolls[number];
      rolls[number] = currentValue + 1;
      rollLog.push(number);
    }
    if (_message.type === "reset") {
      Object.keys(rolls).forEach((number) => {
        rolls[number] = 0;
      });
      rollLog = [];
    }
    if (_message.type === "undo") {
      if (rollLog.length > 0) {
        const number = rollLog.pop();
        const currentValue = rolls[number];
        rolls[number] = currentValue - 1;
      }
    }
    const lastRoll = rollLog[rollLog.length - 1];
    wss.clients.forEach((client) => {
      console.log("rollLog", rollLog);
      console.log("sending:", { lastRoll });
      client.send(JSON.stringify({ type: "roll", rolls, lastRoll }));
    });
  });

  connection.on("close", function (reasonCode, description) {
    console.log(new Date(), "Peer", connection.remoteAddress, "disconnected.", {
      reasonCode,
      description,
    });
  });
});

server
  // .use((req, res) => res.sendFile())
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
