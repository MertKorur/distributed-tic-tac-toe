import express from 'express';
import roomRoutes from './routes/roomRoutes';
import { CONFIG } from "./config";
import { errorHandler } from "./middleware/errorHandler";


const app = express();
app.use(express.json());

// Routes
app.use("/rooms", roomRoutes);

// Root endpoint to check service status
app.get("/", (_, res) => res.send(`${CONFIG.SERVICE_NAME} is running`));

// Middleware
app.use(errorHandler);


// Start server
app.listen(CONFIG.PORT, () => {
  console.log(`${CONFIG.SERVICE_NAME} listening on port ${CONFIG.PORT}`);
});