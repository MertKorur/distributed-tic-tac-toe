export const CONFIG = {
    USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    ROOM_SERVICE_URL: process.env.ROOM_SERVICE_URL || 'http://localhost:3002',
    GAME_SERVICE_URL: process.env.GAME_SERVICE_URL || 'http://localhost:3003',
    WS_URL: process.env.WS_URL || 'ws://localhost:8080'
}