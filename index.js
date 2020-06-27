// const webSocketsServerPort = 8000;
// const webSocketServer = require("websocket").server;
const http = require("http");
// // Spinning the http server and the websocket server.
// const server = http.createServer();
// server.listen(webSocketsServerPort);
// const wsServer = new webSocketServer({
//   httpServer: server,
// });

const express = require("express");
const { Server } = require("ws");

const PORT = process.env.PORT || 8000;
const app = express();

const server = http.createServer(app);

const wss = new Server({ server });

// const clients = {};
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

// // This code generates unique userid for everyuser.
// const getUniqueID = () => {
//   const s4 = () =>
//     Math.floor((1 + Math.random()) * 0x10000)
//       .toString(16)
//       .substring(1);
//   return s4() + s4() + "-" + s4();
// };

wss.on("connection", function (connection) {
  // const userID = getUniqueID();
  console.log(
    new Date() +
      " Recieved a new connection from origin " +
      Object.keys(connection) +
      "."
  );
  connection.send(JSON.stringify({ type: "roll", rolls }));
  // // You can rewrite this part of the code to accept only the requests from allowed origin
  // const connection = request.accept(null, request.origin);
  // connection.sendUTF(JSON.stringify({ type: "roll", rolls }));
  // clients[userID] = connection;
  // console.log(
  //   "connected: " + userID + " in " + Object.getOwnPropertyNames(clients)
  // );

  connection.on("message", (message) => {
    console.log("gotta message", message);
    const _message = JSON.parse(message);
    if (_message.type === "roll") {
      const { number } = _message;
      const currentValue = rolls[number];
      rolls[number] = currentValue + 1;
      // Object.values(clients).forEach((clientConnection) => {
      //   clientConnection.sendUTF(JSON.stringify({ type: "roll", rolls }));
      // });
      // wss.clients.forEach((client) => {
      //   client.send(JSON.stringify({ type: "roll", rolls }));
      // });
    }
    if (_message.type === "reset") {
      Object.keys(rolls).forEach((number) => {
        rolls[number] = 0;
      });
      // Object.values(clients).forEach((clientConnection) => {
      //   clientConnection.sendUTF(JSON.stringify({ type: "roll", rolls }));
      // });
    }
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: "roll", rolls }));
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
