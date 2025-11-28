import { Server } from 'ws';
import axios from 'axios';
import { WSClient } from '../../sdk/wsClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CLI Integration', () => {
  let wss: Server;
  const port = 9091;
  const WS_URL = `ws://localhost:${port}`;
  const roomId = 'room-xyz';
  const usernameX = 'Alice';
  const usernameO = 'Bob';

  beforeAll((done) => {
    wss = new Server({ port }, done);
    wss.on('connection', (socket) => {
      socket.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.action === 'joinRoom') {
          socket.send(JSON.stringify({ action: 'joinedRoom', roomId }));
        }
        if (data.action === 'makeMove') {
          socket.send(JSON.stringify({ action: 'updateBoard', board: Array(9).fill(''), currentPlayer: 'O' }));
        }
      });
    });
  });

  afterAll((done) => wss.close(done));

  test('register, create room, join, make move', async () => {
    mockedAxios.post.mockImplementation((url: string, body: any) => {
      if (url.includes('/users/register')) return Promise.resolve({ data: { username: body.username } });
      if (url.includes('/rooms/create')) return Promise.resolve({ data: { roomId, playerX: usernameX, playerO: null } });
      if (url.includes('/game/join')) return Promise.resolve({ data: { roomId, playerO: usernameO } });
      if (url.includes('/game/move')) return Promise.resolve({ data: { board: Array(9).fill(''), currentPlayer: 'O', winner: null } });
      return Promise.resolve({ data: {} });
    });

    const clientX = new WSClient(roomId, usernameX, WS_URL, { retry: false });
    const messagesReceived: any[] = [];

    clientX.on('message', (msg) => messagesReceived.push(msg));
    clientX.connect();

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (messagesReceived.length >= 1) {
          clientX.disconnect();
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });

    expect(messagesReceived.find((m) => m.action === 'joinedRoom')).toBeDefined();
  });
});
