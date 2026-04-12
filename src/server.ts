import { WebSocketServer, WebSocket } from "ws"

const wss = new WebSocketServer({ port: 3001 });

const rooms = new Map<string, Set<WebSocket>>();

// A new client has connected, here is its socket (ws)
//Whenever a new client connects, give me its socket so I can communicate with it.
wss.on("connection", (ws) => {
    // server received message from the client.
    ws.on("message", (data) => {
        console.log("raw data", data);
        const message = JSON.parse(data.toString());
        const { type, roomId } = message;
        console.log("message", message);


        // join room
        if (type == "join") {
            // if room is not created create empty room 
            if (!rooms.has(roomId))
                rooms.set(roomId, new Set());
            // add WebSocket to it
            rooms.get(roomId)!.add(ws);
            // send conncetion response to client. 
            ws.send(JSON.stringify({ type: "joined_123" }));
            console.log("Server joined through: ", roomId);
        }

        // when User send message via signal type

        if (type === "offer" || type === "answer" || type === "ice-candidate" || type === "signal") {
            console.log("Signal Received1");
            const clients = rooms.get(roomId);
            if (!clients) return;
            console.log("Signal Received2");
            // iterate over all clients(peers) 
            clients.forEach(client => {
                // when connection is stablished then P1 can send message to all peers except itself.
                if (client !== ws) 
                    client.send(JSON.stringify(message));
            });
        }

    });

    // WebSocket connection is closed.
    // User closes tab / browser
    ws.on("close", () => {
        rooms.forEach((clients) => clients.delete(ws));
        console.log("ws closed");

    });
});

console.log("Server running on ws://localhost:3001");

