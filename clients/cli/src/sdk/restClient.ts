import axios, { AxiosInstance } from 'axios';
import { USER_SERVICE_URL, ROOM_SERVICE_URL, GAME_SERVICE_URL } from '../config';
import { User, GameState, GameStartResponse, GameMoveResponse } from '../types';

export class RestSDK {
  private userClient: AxiosInstance;
  private roomClient: AxiosInstance;
  private gameClient: AxiosInstance;

  constructor(userUrl = USER_SERVICE_URL, roomUrl = ROOM_SERVICE_URL, gameUrl = GAME_SERVICE_URL) {
    this.userClient = axios.create({ baseURL: userUrl, timeout: 5000 });
    this.roomClient = axios.create({ baseURL: roomUrl, timeout: 5000 });
    this.gameClient = axios.create({ baseURL: gameUrl, timeout: 5000 });
  }

  // Users
  async registerUser(username: string): Promise<User> {
    const res = await this.userClient.post('/users/register', { username });
    return res.data as User;
  }

  async getUserByUsername(username: string): Promise<User> {
    const res = await this.userClient.get(`/users/username/${encodeURIComponent(username)}`);
    return res.data as User;
  }

  async listUsers(): Promise<User[]> {
    const res = await this.userClient.get('/users/');
    return res.data as User[];
  }

  // Rooms
  async createRoom(username: string): Promise<GameStartResponse> {
    const res = await this.roomClient.post('/rooms/create', { username });
    return res.data as GameStartResponse;
  }

  async listRooms(): Promise<any[]> {
    const res = await this.roomClient.get('/rooms/list');
    return res.data as any[];
  }

  // Game service
  async startGame(roomId: string, playerX: string, playerO?: string) {
    const res = await this.gameClient.post('/game/start', { roomId, playerX, playerO });
    return res.data;
  }

  async joinGame(roomId: string, playerO: string) {
    const res = await this.gameClient.post('/game/join', { roomId, playerO });
    return res.data;
  }

  async makeMove(roomId: string, player: 'X' | 'O', position: number): Promise<GameMoveResponse> {
    const res = await this.gameClient.post('/game/move', { roomId, player, position });
    return res.data as GameMoveResponse;
  }

  async getGameStatus(roomId: string): Promise<GameState> {
    const res = await this.gameClient.get(`/game/status/${encodeURIComponent(roomId)}`);
    return res.data as GameState;
  }

  async endGame(roomId: string) {
    const res = await this.gameClient.delete(`/game/end/${encodeURIComponent(roomId)}`);
    return res.data;
  }
}
