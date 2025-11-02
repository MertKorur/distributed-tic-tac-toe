import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';
import { CONFIG } from "./config";
import { errorHandler } from "./middleware/errorHandler";


const app = express();
app.use(express.json());

// Routes
app.use('/users', userRoutes);

// Check service status
app.get("/", (req: Request, res: Response) => res.send(`${CONFIG.SERVICE_NAME} is running`));

app.use(errorHandler);


// Start server
app.listen(CONFIG.PORT, () => {
    console.log(`${CONFIG.SERVICE_NAME} listening on port ${CONFIG.PORT}`)
});