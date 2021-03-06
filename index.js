const http = require("http");
const express = require("express");
const { Server } = require("ws");
// const { Client } = require("pg");

const PORT = process.env.PORT || 8000;
const app = express();

const server = http.createServer(app);

const wss = new Server({ server });

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });
// client.connect();

const getRollCount = (rolls) =>
  Object.values(rolls).reduce((prev, roll) => prev + roll, 0);

const rolls = {
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
let players = [];

wss.on("connection", function (connection) {
  console.log(
    new Date() +
      " Recieved a new connection from origin " +
      Object.keys(connection) +
      "."
  );
  connection.send(
    JSON.stringify({
      type: "data",
      rolls,
      lastRoll: rollLog[rollLog.length - 1],
      rollCount: getRollCount(rolls),
      players,
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
      players = [];
    }
    if (_message.type === "undo") {
      if (rollLog.length > 0) {
        const number = rollLog.pop();
        const currentValue = rolls[number];
        rolls[number] = currentValue - 1;
      }
    }
    if (_message.type === "addPlayer") {
      const { player } = _message;
      players.push(player);
    }
    if (_message.type === "__ping__") {
      connection.send(
        JSON.stringify({
          type: "__pong__",
        })
      );
    } else {
      const lastRoll = rollLog[rollLog.length - 1];
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "data",
            rolls,
            lastRoll,
            players,
            rollCount: getRollCount(rolls),
          })
        );
      });
    }
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
