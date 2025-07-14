// pages/api/admin/rewards.js
import db from '../../../lib/db';

export default function handler(req, res) {
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return res.status(403).json({ message: '无权限操作。' });
  }

  if (req.method === 'GET') {
    try {
      const rewards = db.prepare("SELECT * FROM rewards").all();
      return res.status(200).json(rewards);
    } catch (error) {
      console.error('获取商品失败:', error);
      return res.status(500).json({ message: '获取商品时发生错误。' });
    }
  }

  if (req.method === 'POST') {
    const { name, cost, description, image_url } = req.body;
    if (!name || !cost) {
      return res.status(400).json({ message: '商品名称和积分是必填项。' });
    }
    try {
      const info = db.prepare(
        `INSERT INTO rewards (name, cost, description, image_url) VALUES (?, ?, ?, ?)`
      ).run(name, cost, description, image_url);
      return res.status(200).json({ message: '商品添加成功！', rewardId: info.lastInsertRowid });
    } catch (error) {
      console.error('添加商品失败:', error);
      return res.status(500).json({ message: '添加商品时发生错误。' });
    }
  }
  
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: '缺少商品ID。' });
    }
    try {
      const info = db.prepare(`DELETE FROM rewards WHERE id = ?`).run(id);
      if (info.changes === 0) {
        return res.status(404).json({ message: '未找到要删除的商品。' });
      }
      return res.status(200).json({ message: '商品删除成功！' });
    } catch (error) {
      console.error('删除商品失败:', error);
      return res.status(500).json({ message: '删除商品时发生错误。' });
    }
  }

  res.status(405).end();
}