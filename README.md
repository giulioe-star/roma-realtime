# Roma Realtime GTFS-RT Decoder

Questo servizio:

- scarica il feed GTFS-RT di Roma Mobilità
- decodifica il file `.pb` con protobufjs
- restituisce **solo la lista dei veicoli** in JSON

## Endpoint

GET /

Restituisce:

[
  {
    "id": "...",
    "trip": { ... },
    "position": { ... },
    "timestamp": ...
  }
]

## Deploy su Render

1. Vai su Render → New → Web Service  
2. Scegli "Public Git Repository"  
3. Incolla l'URL del tuo repository GitHub  
4. Build command: `npm install`  
5. Start command: `npm start`  
6. Deploy
