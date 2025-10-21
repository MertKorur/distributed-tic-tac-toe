import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Room Service is up and running!");
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Room Service running on port ${PORT}`);
});
