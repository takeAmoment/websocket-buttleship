import http from 'node:http';
import 'dotenv/config';
import { WebSocketServer } from 'ws';

const PORT = process.env.HTTP_PORT;

const closeServers = (
  wss: WebSocketServer,
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  console.log('Shutting down WebSocket server...');
  // close connection for all clients
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.close(1001, 'Server shoutting down.');
    }
  });
  // close servers
  wss.close(() => {
    console.log('Websocket server close.');
    server.close(() => {
      console.log('HTTP server close.');
      process.exit(0);
    });
  });
};

export const createWSServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  // create new ws server
  const wss = new WebSocketServer({ server }, () => {
    console.log('WebSocket server started');
    console.log(`Listening on ws://localhost:${PORT}`);
  });
  console.log('WebSocket server started');
  console.log(`Listening on ws://localhost:${PORT}`);

  // ws - client object, req - http request
  wss.on('connection', (ws, req) => {
    console.log('Client connected.');
    const clientIP = req.socket.remoteAddress;
    console.log(`New WebSocket connection from ${clientIP}`);
    console.log(`Total clients connected: ${wss.clients.size}`);

    // handle income messages from client to WS server
    ws.on('message', (message) => {
      try {
        // parse string to js object
        const data = JSON.parse(message.toString());
        console.log(`Received data: ${data}`);
        const response = JSON.stringify({
          data: 'Test from client to ws',
          type: 'Test'
        });
        // send response to client
        ws.send(response);

        // send data all open clients
        wss.clients.forEach((client) => {
          // check if client is open
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({ type: 'Test to other clients', data: data })
            );
          }
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.error('Invalid JSON received:', message.toString());
        ws.send(JSON.stringify({ error: 'Invalid JSON format.' }));
      }

      ws.send(JSON.stringify({ type: 'welcome', message: 'Hello from server' }));

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  });

  process.on('SIGINT', () => closeServers(wss, server));
  process.on('SIGTERM', () => closeServers(wss, server));
};

