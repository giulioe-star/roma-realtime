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
    const vehicles = object.entity
      .filter(e => e.vehicle)
      .map(e => ({
        id: e.id,
        trip: e.vehicle.trip || null,
        position: e.vehicle.position || null,
        timestamp: e.vehicle.timestamp || null
      }));

    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Decoding failed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
