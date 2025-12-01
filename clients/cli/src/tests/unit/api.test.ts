import { apiClient, registerUser, getUser, listUsers, createRoom, joinGame, makeMove } from '../../sdk/api';
import { User, GameStartResponse, GameMoveResponse } from '../../types';

describe('API SDK', () => {
  const username = 'Alice';
  const roomId = 'room123';

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('registerUser returns user', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { username } });
    const user: User = await registerUser(username);
    expect(user.username).toBe(username);
    expect(postSpy).toHaveBeenCalledWith(expect.stringContaining('/users/register'), { username });
  });

  test('getUser returns null on 404', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockRejectedValueOnce({ response: { status: 404 } });
    const user = await getUser(username);
    expect(user).toBeNull();
    expect(getSpy).toHaveBeenCalledWith(expect.stringContaining(`/users/username/${username}`));
  });

  test('listUsers returns array', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: [{ username }] });
    const users = await listUsers();
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe(username);
    expect(getSpy).toHaveBeenCalledWith(expect.stringContaining('/users/'));
  });

  test('createRoom returns roomId', async () => {
    const roomData: GameStartResponse = { roomId, playerX: username, playerO: undefined };
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: roomData });
    const room = await createRoom(username);
    expect(room.roomId).toBe(roomId);
    expect(postSpy).toHaveBeenCalledWith(expect.stringContaining('/rooms/create'), { username });
  });

  test('joinGame returns data', async () => {
    const resData = { roomId, playerO: 'Bob' };
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: resData });
    const res = await joinGame(roomId, 'Bob');
    expect(res.roomId).toBe(roomId);
    expect(postSpy).toHaveBeenCalledWith(expect.stringContaining('/game/join'), { roomId, playerO: 'Bob' });
  });

  test('makeMove returns board', async () => {
  const board = Array(9).fill('');
  const moveData: GameMoveResponse = { 
    roomId: 'room123',    // add this
    board, 
    currentPlayer: 'X', 
    winner: null 
  };
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: moveData });
    const res = await makeMove('room123', 'X', 0);
    expect(res.board).toEqual(board);
    expect(postSpy).toHaveBeenCalledWith(expect.stringContaining('/game/move'), { roomId: 'room123', player: 'X', position: 0 });
  });
});
