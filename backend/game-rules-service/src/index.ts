import express, { Request, Response } from 'express';
import { WebSocketServer } from 'ws';

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Game Rules Service is running');
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Game Rules Service running on port ${PORT}`);
});
