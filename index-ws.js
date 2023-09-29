const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", function (_req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);

const PORT = 3000;
server.listen(PORT, function () {
  console.log(`server started on port ${PORT}`);
});

process.on("SIGINT", function interceptSigInt() {
  wss.clients.forEach(function each(client) {
    client.close();
  });
  server.close(function closeServer() {
    shutdownDb();
  });
});

/** Begin websockets */
const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  db.run(`INSERT INTO visitors (count, time)
    VALUES(${numClients}, datetime('now'))
  `);

  ws.on("close", function close() {
    wss.broadcast(`Current visitors: ${numClients}`);
    console.log("A client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
/** end websocket */
/** begin database */
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(function serialize() {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", function each(_err, row) {
    console.log(row);
  });
}

function shutdownDb() {
  getCounts();
  console.log("shutting down db...");
  db.close();
}
