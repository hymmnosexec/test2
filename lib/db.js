// lib/db.js
import Database from 'better-sqlite3';
import fs from 'fs';

let db = null;
const dbPath = './volunteer_platform.db';

// 检查数据库文件是否存在，如果不存在则创建它
if (!fs.existsSync(dbPath)) {
  db = new Database(dbPath);
  console.log('数据库文件已创建。');

  // 创建表
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      real_name TEXT,
      email TEXT,
      phone TEXT,
      volunteer_hours INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0
    );

    CREATE TABLE activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      service_hours INTEGER DEFAULT 0,
      creator_username TEXT
    );

    CREATE TABLE signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      activity_id INTEGER NOT NULL,
      signup_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (username) REFERENCES users(username),
      FOREIGN KEY (activity_id) REFERENCES activities(id)
    );
    
    CREATE TABLE rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cost INTEGER NOT NULL,
      description TEXT,
      image_url TEXT
    );
  `);
  
  console.log('数据库表已创建。');
  
  // 插入默认数据
  const insertUser = db.prepare(`INSERT OR IGNORE INTO users (username, password, real_name) VALUES (?, ?, ?)`);
  insertUser.run('admin', 'adminpass', '管理员');
  insertUser.run('user1', 'user1pass', '张三');

  const insertReward = db.prepare(`INSERT INTO rewards (name, cost, description, image_url) VALUES (?, ?, ?, ?)`);
  insertReward.run('雨伞', 10, '社区定制雨伞', '');
  insertReward.run('水杯', 20, '环保保温水杯', '');
  
  console.log('默认数据已插入。');

} else {
  db = new Database(dbPath);
  console.log('数据库已连接。');

  // 检查并添加缺失的字段，确保所有更新都包含在内
  const activitiesColumns = db.prepare(`PRAGMA table_info(activities)`).all().map(c => c.name);
  const usersColumns = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name);
  
  try {
    if (!activitiesColumns.includes('service_hours')) {
      db.exec(`ALTER TABLE activities ADD COLUMN service_hours INTEGER DEFAULT 0`);
      console.log('activities表：service_hours字段已添加。');
    }
    if (!activitiesColumns.includes('creator_username')) {
      db.exec(`ALTER TABLE activities ADD COLUMN creator_username TEXT`);
      console.log('activities表：creator_username字段已添加。');
    }
    // 添加新的 ALTER TABLE 语句
    if (!usersColumns.includes('points')) {
      db.exec(`ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0`);
      console.log('users表：points字段已添加。');
    }
  } catch (err) {
    console.error('添加字段时出错 (可能字段已存在):', err.message);
  }
}

export default db;