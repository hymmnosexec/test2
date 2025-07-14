// pages/api/add-activity.js
import db from '../../lib/db';
import { serialize } from 'cookie';

export default function handler(req, res) {
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return res.status(403).json({ message: '无权限操作。' });
  }

  if (req.method === 'POST') {
    const { title, description, service_hours, creator_username } = req.body;
    if (!title || !description || service_hours === undefined || !creator_username) {
      return res.status(400).json({ message: '所有字段都是必填项。' });
    }
    
    try {
      db.prepare(
        `INSERT INTO activities (title, description, service_hours, creator_username) VALUES (?, ?, ?, ?)`
      ).run(title, description, service_hours, creator_username);
      return res.status(200).json({ message: '活动创建成功！' });
    } catch (error) {
      console.error('创建活动失败:', error);
      return res.status(500).json({ message: '创建活动时发生错误。' });
    }
  }

  res.status(405).end();
}