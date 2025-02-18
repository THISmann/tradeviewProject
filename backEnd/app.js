const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const webhookHandler = require("./webhookHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());

// 📩 Route pour les signaux TradingView
app.post("/webhook", webhookHandler);

app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});

module.exports = app;
