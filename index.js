import express from "express";
import fetch from "node-fetch";
import protobuf from "protobufjs";

const app = express();

const FEED_URL =
  "https://romamobilita.it/sites/default/files/rome_rtgtfs_vehicle_positions_feed.pb";

let root = null;

// Carica il file .proto una sola volta
protobuf.load("gtfs-realtime.proto").then(r => {
  root = r;
  console.log("PROTO loaded");
});

app.get("/", async (req, res) => {
  try {
    if (!root) return res.status(503).json({ error: "Proto not loaded yet" });

    const resp = await fetch(FEED_URL);
    const buffer = Buffer.from(await resp.arrayBuffer());

    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    const message = FeedMessage.decode(buffer);
    const object = FeedMessage.toObject(message, { defaults: true });

    // Estrai solo i veicoli
res.json(object.entity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Decoding failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

