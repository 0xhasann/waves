import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { WebSocketMessageSchema } from '../shared';
import type { Name } from '../shared/chatmessage';
import * as z from 'zod';
import { app } from './app';
import { logger } from './units/logger';
//create a http server
// the singaling server
const webServer = createServer(app);
//listen http req and sends http res via PORT
import { appEnv } from './config/env';
webServer.listen(appEnv.PORT, () => {
  logger.info(`Server is listening on http://localhost:${appEnv.PORT}`);
});

interface ExtendedWebSocket extends WebSocket {
  userName?: string;
}

const wsServer = new WebSocketServer({
  server: webServer,
});
// When a client connects to our websocket server
// on connection event is triggered
// on connection returns the websocket instance with it to do operations
const websocketConnections: Map<Name, ExtendedWebSocket> = new Map();
const peerToPeer: Map<Name, Name> = new Map();

function sendWsError(websocket: ExtendedWebSocket, message: string) {
  websocket.send(JSON.stringify({ type: 'error', data: { message } }));
}

function hangupCall(webServer: ExtendedWebSocket) {
  const firstPeer = webServer.userName;
  if (!firstPeer) {
    return;
  }
  const secondPeer = peerToPeer.get(firstPeer);
  if (!secondPeer) {
    return;
  }
  peerToPeer.delete(firstPeer);
  peerToPeer.delete(secondPeer);

  const secondPeerSocket = websocketConnections.get(secondPeer);
  secondPeerSocket?.send(JSON.stringify({ type: 'hang-up' }));

  logger.info('Connection Closed');
}

wsServer.on('connection', (websocket: ExtendedWebSocket) => {
  websocket.on('close', (code: number, reason: Buffer) => {
    logger.debug(`webSocket close reason :: ${code} ${reason.toString()}`);
    hangupCall(websocket);
    if (!websocket.userName) return;
    const existingSocket = websocketConnections.get(websocket.userName);
    if (existingSocket === websocket) websocketConnections.delete(websocket.userName);
  });

  websocket.on('message', (data: Buffer) => {
    try {
      const json = JSON.parse(data.toString()) as unknown;
      const parsedMessage = z.parse(WebSocketMessageSchema, json);
      logger.debug(parsedMessage);

      switch (parsedMessage.type) {
        case 'hang-up':
          hangupCall(websocket);
          break;
        case 'new-ice-candidate':
        case 'video-answer':
        case 'video-offer':
          if (!websocket.userName) {
            sendWsError(websocket, 'Login First');
          } else {
            const peer = peerToPeer.get(websocket.userName);
            if (!peer) {
              sendWsError(websocket, 'Peer Not Found Please Call Them First.');
            } else {
              const peerWebsocket = websocketConnections.get(peer);
              if (!peerWebsocket) {
                sendWsError(websocket, 'Peer Not Found or Disconnected');
              } else {
                peerWebsocket.send(JSON.stringify(parsedMessage));
              }
            }
          }

          break;
        case 'login':
          if (websocketConnections.has(parsedMessage.data.name)) {
            throw new Error('Duplicate Entry: Kindly Use the Old Logged in Tab');
          }
          websocketConnections.set(parsedMessage.data.name, websocket);
          websocket.userName = parsedMessage.data.name;
          break;
        // If call is coming from user to server then name is callee
        // If call is coming from server to user then name is caller
        case 'call':
          if (!websocket.userName) {
            sendWsError(websocket, 'Login First');
          } else {
            if (!websocketConnections.has(parsedMessage.data.name)) {
              sendWsError(websocket, 'Callee does not exist');
            } else {
              const callee = websocketConnections.get(parsedMessage.data.name)!;
              callee.send(
                JSON.stringify({
                  type: 'call',
                  data: { name: websocket.userName },
                }),
              );
            }
          }
          break;
        case 'direct-message':
          if (!websocket.userName) {
            sendWsError(websocket, 'Login First');
          } else if (!parsedMessage.data.to) {
            sendWsError(websocket, 'Receiver not provided');
          } else {
            const receiverSocket = websocketConnections.get(parsedMessage.data.to);
            if (!receiverSocket) {
              sendWsError(websocket, 'Receiver is offline');
            } else {
              receiverSocket.send(
                JSON.stringify({
                  type: 'direct-message',
                  data: {
                    from: websocket.userName,
                    content: parsedMessage.data.content,
                    conversationId: parsedMessage.data.conversationId,
                    sentAt: new Date().toISOString(),
                  },
                }),
              );
            }
          }
          break;
        case 'accept':
          if (!websocket.userName) {
            sendWsError(websocket, 'Login First');
          } else {
            peerToPeer.set(parsedMessage.data.name, websocket.userName);
            peerToPeer.set(websocket.userName, parsedMessage.data.name);
            const callerSocket = websocketConnections.get(parsedMessage.data.name);
            callerSocket?.send(
              JSON.stringify({
                type: 'accept',
                data: { name: websocket.userName },
              }),
            );
          }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.info(err);
        websocket.send(
          JSON.stringify({
            type: 'validation-error',
            errors: z.treeifyError(err),
          }),
        );
      } else if (err instanceof Error && err.message.startsWith('Duplicate Entry')) {
        websocket.send(JSON.stringify({ type: 'duplicate', data: { message: err.message } }));
      } else {
        websocket.send(
          JSON.stringify({
            type: 'invalid-json',
          }),
        );
      }
    }
  });
});

wsServer.on('close', () => {
  logger.info('Websocket Server Closed');
});

wsServer.on('error', (err) => {
  logger.error('WS Server Error:', err);
});
