import { User } from 'shared/types';

let users: User[] = [];
let nextId = 1;

export function registerUser(username: string): User {
  if (!username || username.trim() === "") {
    throw new Error("Username is required");
  }

  if (users.find(u => u.username === username)) {
    throw new Error("Username already exists");
  }

  const newUser: User = { 
    id: nextId++, 
    username
  };

  users.push(newUser);
  return newUser;
}

export function getAllUsers(): User[] {
  return users;
}

export function getUserById(id: number): User | undefined {
  return users.find(u => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return users.find(u => u.username === username);
}
