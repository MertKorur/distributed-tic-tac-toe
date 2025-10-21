import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Game Rules Service running on port ${PORT}`);
});
