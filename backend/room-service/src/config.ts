export const CONFIG = {
  PORT: process.env.PORT || 3002,
  SERVICE_NAME: "Room Service",
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || "http://localhost:3001",
  GAME_RULES_SERVICE_URL: process.env.GAME_RULES_SERVICE_URL || "http://localhost:3003",
  WS_PORT: process.env.WS_PORT
};
