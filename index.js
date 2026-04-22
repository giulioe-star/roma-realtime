import express from "express";
import fetch from "node-fetch";
import protobuf from "protobufjs";

const app = express();

// Tutti i feed possibili di Roma Mobilità
const FEEDS = [
  "https://romamobilita.it/sites/default/files/rome_rtgtfs_vehicle_positions_feed.pb",
  "https://romamobilita.it/sites/default/files/rome_rtgtfs_vehicle_positions_feed_0.pb",
  "https://romamobilita.it/sites/default/files/rome_rtgtfs_trip_updates_feed.pb",
  "https://romamobilita.it/sites/default/files/rome_rtgtfs_alerts_feed.pb",
  "https://romamobilita.it/sites/default/files/rome_rtgtfs_feed.pb"
];

let root = null;

// Carica il PROTO completo
protobuf.load("gtfs-realtime.proto").then(r => {
  root = r;
  console.log("PROTO loaded");
});

async function decodeFeed(url) {
  try {
    const resp = await fetch(url);
    const buffer = Buffer.from(await resp.arrayBuffer());

    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    const message = FeedMessage.decode(buffer);
    const object = FeedMessage.toObject(message, { defaults: true });

    return object.entity || [];
  } catch (err) {
    console.log("Errore su", url, err);
    return [];
  }
}

app.get("/", async (req, res) => {
  if (!root) return res.status(503).json({ error: "Proto not loaded yet" });

  let results = [];

  for (const url of FEEDS) {
    console.log("Testing feed:", url);

    const entities = await decodeFeed(url);

    if (entities.length > 0) {
      console.log("FOUND DATA in:", url);
      return res.json({
        feed: url,
        count: entities.length,
        entities
      });
    }

    results.push({ feed: url, count: 0 });
  }

  // Nessun feed contiene dati
  res.json({
    message: "Tutti i feed sono vuoti",
    results
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
