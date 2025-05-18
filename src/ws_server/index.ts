import http from 'node:http';
import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { checkMessageType, parseString, stringifyObj } from 'utils';
import { ClientMessageTypesEnum } from 'enums';

const PORT = process.env.HTTP_PORT;

const closeServers = (
  wss: WebSocketServer,
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  console.log('\nShutting down WebSocket server...');
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
    ws.send(JSON.stringify({ type: 'welcome developer', message: 'Hello from server' }));

    // handle income messages from client to WS server
    ws.on('message', async (message) => {
      try {
        // parse string to js object
        const data = parseString(message.toString());
        console.log('Received data:', data);

        const responseArr = await checkMessageType(data, ws as unknown as WebSocket);

        // send response to client
        responseArr?.forEach((response) => {
          const responseJSON = stringifyObj(response as unknown as Record<string, unknown>);
          console.log('Response data:', response);
          ws.send(responseJSON);
        });
      

        // send data all open clients
        wss.clients.forEach((client) => {
          // check if client is open
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({ type: 'Test to other clientsq1', data: data })
            );
            responseArr?.forEach((response) => {
              if(response?.type === ClientMessageTypesEnum.UPDATE_ROOM){
                const responseJSON = stringifyObj(response as unknown as Record<string, unknown>);
                console.log('Response data json:', responseJSON);
                client.send(responseJSON);
                client.send(JSON.stringify({type: response, data: response }));
              }
             
            });

          }
        });
      } catch (error) {
        const err = error as unknown as Error;
        console.error('Invalid JSON received:', message.toString());
        ws.send(JSON.stringify({ error: err.message }));
      }

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  });

  process.on('SIGINT', () => closeServers(wss, server));
  process.on('SIGTERM', () => closeServers(wss, server));
};

