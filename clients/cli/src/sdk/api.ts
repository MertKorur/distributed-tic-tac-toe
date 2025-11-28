// clients/cli/src/sdk/api.ts
import axios from 'axios';
import http from 'http';
import https from 'https';
import { User, GameStartResponse, GameMoveResponse, GameState } from '../types';

const agentOpts = { keepAlive: false }; // explicitly disable keep-alive

const httpAgent = new http.Agent(agentOpts);
const httpsAgent = new https.Agent(agentOpts);

const apiClient = axios.create({
  timeout: 5000,
  httpAgent,
  httpsAgent,
  headers: { 'Content-Type': 'application/json' },
});

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';

export const registerUser = async (username: string): Promise<User> => {
  try {
    const res = await apiClient.post<User>(`${USER_SERVICE_URL}/users/register`, { username });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 409) return { username };
    throw err;
  }
};

export const getUser = async (username: string): Promise<User | null> => {
  try {
    const res = await apiClient.get<User>(`${USER_SERVICE_URL}/users/username/${encodeURIComponent(username)}`);
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

export const listUsers = async (): Promise<User[]> => {
  const res = await apiClient.get<User[]>(`${USER_SERVICE_URL}/users/`);
  return res.data;
};

export const createRoom = async (username: string) => {
  const res = await apiClient.post(`${ROOM_SERVICE_URL}/rooms/create`, { username });
  return res.data as GameStartResponse;
};

export const listRooms = async () => {
  const res = await apiClient.get(`${ROOM_SERVICE_URL}/rooms/list`);
  return res.data;
};

export const joinGame = async (roomId: string, playerO: string) => {
  const res = await apiClient.post(`${GAME_SERVICE_URL}/game/join`, { roomId, playerO });
  return res.data;
};

export const makeMove = async (roomId: string, player: 'X'|'O', position: number) => {
  const res = await apiClient.post<GameMoveResponse>(`${GAME_SERVICE_URL}/game/move`, { roomId, player, position });
  return res.data;
};

export const getGameStatus = async (roomId: string): Promise<GameState> => {
  const res = await apiClient.get<GameState>(`${GAME_SERVICE_URL}/game/status/${roomId}`);
  return res.data;
};

export const endGame = async (roomId: string) => {
  await apiClient.delete(`${GAME_SERVICE_URL}/game/end/${roomId}`);
};
