import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

interface User {
    id: number;
    username: string;
}

let users: User[] = [];


app.post("/register", (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) return res.status(400).send("Username is required");

    const user: User = { id: users.length + 1, username };
    users.push(user);
    res.status(201).send(user);
});

app.get("/users/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).send("User not found");
  res.json(user);
});

app.get("/", (req: Request, res: Response) => {
  res.send("User Service is up and running!");
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`User service listening on port ${PORT}`)
});

