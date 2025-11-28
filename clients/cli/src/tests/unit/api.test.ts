import axios from 'axios';
import * as api from '../../sdk/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API SDK', () => {
  const username = 'Alice';
  const roomId = 'room123';

  beforeEach(() => jest.clearAllMocks());

  test('registerUser returns user', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { username } });
    const user = await api.registerUser(username);
    expect(user.username).toBe(username);
  });

  test('getUser returns null on 404', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });
    const user = await api.getUser(username);
    expect(user).toBeNull();
  });

  test('listUsers returns array', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ username }] });
    const users = await api.listUsers();
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe(username);
  });

  test('createRoom returns roomId', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { roomId, playerX: username, playerO: null } });
    const room = await api.createRoom(username);
    expect(room.roomId).toBe(roomId);
  });

  test('joinGame returns data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { roomId, playerO: 'Bob' } });
    const res = await api.joinGame(roomId, 'Bob');
    expect(res.roomId).toBe(roomId);
  });

  test('makeMove returns board', async () => {
    const board = Array(9).fill('');
    mockedAxios.post.mockResolvedValueOnce({ data: { board, currentPlayer: 'X', winner: null } });
    const res = await api.makeMove(roomId, 'X', 0);
    expect(res.board).toEqual(board);
  });
});
