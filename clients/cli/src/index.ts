import inquirer from "inquirer";
import { TicTacToeClient } from "../../sdk/dist/index.js";

const client = new TicTacToeClient(
  "http://localhost:3001", // user service
  "http://localhost:3002", // room service
  "http://localhost:3003", // game service
  "ws://localhost:8080" // websocket server
);

let username = "";
let roomId = "";
let ws: any;

async function main() {
  // Register user
  const reg = await inquirer.prompt({
    type: "input",
    name: "username",
    message: "Enter your username:",
  });

  username = reg.username;
  await client.api.registerUser(username).catch(() => {});
  console.log(`Registered as ${username}`);

  // Create or join room
  const choice = await inquirer.prompt({
    type: "list",
    name: "roomAction",
    message: "Do you want to create a new room or join an existing one?",
    choices: ["Create", "Join"],
  });

  if (choice.roomAction === "Create") {
    const room = await client.api.createRoom(username);
    roomId = room.roomId;
    console.log(`Created and joined room with ID: ${roomId}`);
  } else {
    const join = await inquirer.prompt({
      type: "input",
      name: "roomId",
      message: "Enter the room ID to join:",
    });
    roomId = join.roomId;
    await client.api.joinRoom(roomId, username);
    console.log(`Joined room with ID: ${roomId}`);
  }

  // Connect to WebSocket
  ws = client.connectWS();

  ws.on("updateBoard", (msg: any) => {
    console.log("\nBoard updated:");
    printBoard(msg.board);
    console.log(`Current player: ${msg.currentPlayer}`);
    if (msg.winner) console.log(`Winner: ${msg.winner}`);
  });

  ws.on("userJoined", (msg: any) => console.log(`${msg.username} joined the game.`));
  ws.on("userLeft", (msg: any) => console.log(`${msg.username} left the game.`));
  ws.on("gameOver", (msg: any) => console.log(`Winner: ${msg.winner || "Draw"}`));
  ws.on("error", (msg: any) => console.log(`Error: ${msg.message}`));

  ws.joinRoom(roomId, username);

  // Game loop
  while (true) {
    const move = await inquirer.prompt({
      type: "input",
      name: "position",
      message: "Enter your move (0-8):",
    });
    ws.makeMove(roomId, username, Number(move.position));
  }
}


function printBoard(board: string[]) {    
console.log(`
    ${board[0] || " "} | ${board[1] || " "} | ${board[2] || " "}
    ----------
    ${board[3] || " "} | ${board[4] || " "} | ${board[5] || " "}
    ----------
    ${board[6] || " "} | ${board[7] || " "} | ${board[8] || " "}
`);
}

main();