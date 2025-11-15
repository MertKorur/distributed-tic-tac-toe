import express from 'express';
import roomRoutes from './routes/roomRoutes';
import { CONFIG } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { initWebSocket } from './ws/wsServer';

const app = express();
app.use(express.json());

// HTTP Routes
app.use("/rooms", roomRoutes);
app.get("/", (_, res) => res.send(`${CONFIG.SERVICE_NAME} is running`));
app.use(errorHandler);

// Start HTTP server
app.listen(CONFIG.PORT, () => {
  console.log(`${CONFIG.SERVICE_NAME} listening on port ${CONFIG.PORT}`);
});

// Start WebSocket server
initWebSocket(CONFIG.WS_PORT);