import db from '../../lib/db';

export default function handler(req, res) {
  db.prepare("INSERT INTO rewards (name, cost) VALUES (?, ?)").run("志愿者徽章", 5);
  db.prepare("INSERT INTO rewards (name, cost) VALUES (?, ?)").run("纪念手环", 10);
  db.prepare("INSERT INTO rewards (name, cost) VALUES (?, ?)").run("社区T恤", 20);
  res.status(200).json({ message: '初始化成功' });
}