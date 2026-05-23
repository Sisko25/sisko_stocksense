import fs from "fs";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const dbPath = isProd ? "/tmp/db.json" : path.join(process.cwd(), "db.json");

export interface User {
  email: string;
  password?: string;
  isPremium: boolean;
}

export function getDb(): { users: User[] } {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }));
  }
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
}

export function saveDb(data: { users: User[] }) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function findUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.users.find(u => u.email === email);
}

export function createUser(user: User): User {
  const db = getDb();
  db.users.push(user);
  saveDb(db);
  return user;
}

export function updateUser(email: string, updates: Partial<User>) {
  const db = getDb();
  const userIndex = db.users.findIndex(u => u.email === email);
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    saveDb(db);
  }
}
