import express from 'express';
import gameRoutes from './routes/gameRoutes';
import { CONFIG } from "./config";
import { errorHandler } from "./middleware/errorHandler";


const app = express();
app.use(express.json());

// Routes
app.use("/game", gameRoutes);

// Root endpoint to check service status
app.get("/", (_, res) => res.send(`${CONFIG.SERVICE_NAME} is running`));

// Middleware
app.use(errorHandler);


// Start Server
app.listen(CONFIG.PORT, () => {
  console.log(`${CONFIG.SERVICE_NAME} listening on port ${CONFIG.PORT}`);
});