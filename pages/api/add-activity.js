// pages/api/add-activity.js
import db from '../../lib/db';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return res.status(403).json({ message: '无权限操作。' });
  }

  const { title, description, service_hours } = req.body;

  try {
    const info = db.prepare(
      `INSERT INTO activities (title, description, service_hours) VALUES (?, ?, ?)`
    ).run(title, description, service_hours);

    res.status(200).json({ message: '活动添加成功！', activityId: info.lastInsertRowid });
  } catch (error) {
    console.error('添加活动失败:', error);
    res.status(500).json({ message: '添加活动时发生错误。' });
  }
}