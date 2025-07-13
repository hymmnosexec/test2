// pages/api/update-profile.js
import db from '../../lib/db';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, real_name, email, phone } = req.body;
    
    // 确保用户名存在，防止恶意更新
    if (!username) {
        return res.status(400).json({ message: '用户名缺失。' });
    }

    try {
      db.prepare(
        `UPDATE users 
         SET real_name = ?, email = ?, phone = ? 
         WHERE username = ?`
      ).run(real_name, email, phone, username);

      res.status(200).json({ message: '个人资料更新成功！' });
    } catch (error) {
      console.error('更新个人资料失败:', error);
      res.status(500).json({ message: '更新个人资料时发生错误。' });
    }
  } else {
    res.status(405).end(); // 只接受 POST 请求
  }
}