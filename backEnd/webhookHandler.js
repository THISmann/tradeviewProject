const WebSocket = require("ws");

const API_TOKEN = process.env.BROKER_API_TOKEN;
const APP_ID = process.env.APP_ID; // Ton app_id Deriv
const DERIV_WEBSOCKET_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

module.exports = async (req, res) => {
  const { symbol, action, amount, duration } = req.body;

  if (!symbol || !action || !amount || !duration) {
    return res.status(400).json({ error: "Données invalides" });
  }

  console.log(`📊 Signal reçu: ${action} ${symbol} pour ${amount} USD (Durée: ${duration})`);

  const ws = new WebSocket(DERIV_WEBSOCKET_URL);

  ws.on("open", () => {
    console.log("✅ Connexion WebSocket ouverte avec Deriv.");

    // Autorisation via token
    ws.send(JSON.stringify({ authorize: API_TOKEN }));
  });

  ws.on("message", (data) => {
    const response = JSON.parse(data);

    if (response.error) {
      console.error("❌ Erreur :", response.error);
      res.status(500).json({ error: response.error.message || "Erreur inconnue" });
      ws.close();
      return;
    }

    // 📌 Vérification d'authentification
    if (response.msg_type === "authorize") {
      console.log("🔑 Authentification réussie, envoi du trade...");

      ws.send(
        JSON.stringify({
          buy: 1,
          price: amount,
          parameters: {
            symbol: symbol,
            amount: amount,
            duration: duration,
            basis: "stake",
            contract_type: action.toUpperCase() === "BUY" ? "CALL" : "PUT",
            currency: "USD",
          },
        })
      );
    }

    // 📌 Confirmation de l'exécution du trade
    if (response.msg_type === "buy") {
      console.log("✅ Trade exécuté :", response);
      res.json({ success: true, trade: response });
      ws.close();
    }
  });

  ws.on("error", (err) => {
    console.error("❌ Erreur WebSocket :", err);
    res.status(500).json({ error: "Erreur de connexion WebSocket" });
  });

  ws.on("close", () => {
    console.log("🔌 Connexion WebSocket fermée.");
  });
};
