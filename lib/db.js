import Database from 'better-sqlite3';

const db = new Database('volunteer.db');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT
  );

CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  activity_id INTEGER,
  signup_time TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(username, activity_id)
);

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT,
  points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  cost INTEGER
);

CREATE TABLE IF NOT EXISTS redeems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  reward_id INTEGER,
  redeem_time TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// 插入初始数据
const row = db.prepare("SELECT COUNT(*) as count FROM activities").get();
if (row.count === 0) {
  db.prepare("INSERT INTO activities (title, description) VALUES (?, ?)").run("清洁公园", "一起打扫市中心公园");
  db.prepare("INSERT INTO activities (title, description) VALUES (?, ?)").run("敬老院陪伴", "陪老人聊天、表演节目");
}

export default db;

