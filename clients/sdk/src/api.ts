import axios from 'axios';

export class TicTacToeAPI {
  constructor(
    private userServiceUrl: string,
    private gameServiceUrl: string,
    private roomServiceUrl: string
  ) {}

  async registerUser(username: string) {
    const response = await axios.post(`${this.userServiceUrl}/register`, { username });
    return response.data;
  }

  async getUser(username: string) {
    const response = await axios.get(`${this.userServiceUrl}/user/${username}`);
    return response.data;
  }

  async createRoom(username: string) {
    const response = await axios.post(`${this.roomServiceUrl}/create`, { username });
    return response.data;
  }

  async startGame(roomId: string, playerX: string, playerO: string) {
    const response = await axios.post(`${this.gameServiceUrl}/start`, { roomId, playerX, playerO });
    return response.data;
  }

  async joinRoom(roomId: string, playerO: string) {
    const response = await axios.post(`${this.roomServiceUrl}/join`, { roomId, playerO });
    return response.data;
  }

  async makeMove(roomId: string, player: string, position: number) {
    const response = await axios.post(`${this.gameServiceUrl}/move`, { roomId, player, position });
    return response.data;
  }

  async getGameState(roomId: string) {
    const response = await axios.get(`${this.gameServiceUrl}/state/${roomId}`);
    return response.data;
  }
}