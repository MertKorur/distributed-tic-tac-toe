import { Server } from 'ws';
import { WSClient } from '../../sdk/wsClient';

describe('WSClient', () => {
  let wss: Server;
  const port = 9000;
  const WS_URL = `ws://localhost:${port}`;

  beforeAll((done) => {
    wss = new Server({ port }, done);

    wss.on('connection', (socket) => {
      socket.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.action === 'joinRoom') {
          socket.send(JSON.stringify({ action: 'joinedRoom', roomId: data.roomId }));
        }
      });
    });
  });

  afterAll((done) => wss.close(done));

  test('connects → sends joinRoom → receives joinedRoom', async () => {
    const client = new WSClient('room123', 'Alice', WS_URL, { retry: false });

    const events: string[] = [];
    const received: any[] = [];

    client.on('connected', () => events.push('connected'));
    client.on('message', (msg) => received.push(msg));

    client.connect();

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (received.find((m) => m.action === 'joinedRoom')) {
          clearInterval(interval);
          client.disconnect();
          resolve();
        }
      }, 50);
    });

    expect(events).toContain('connected');
    expect(received.find((m) => m.action === 'joinedRoom')).toBeDefined();
  });
});
