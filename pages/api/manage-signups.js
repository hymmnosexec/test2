// pages/api/manage-signups.js
import db from '../../lib/db';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { signupId, newStatus } = req.body;
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  if (!usernameCookie) {
    return res.status(401).json({ message: '请先登录。' });
  }

  const username = usernameCookie.split('=')[1];
  if (username !== 'admin') {
    return res.status(403).json({ message: '无权限执行此操作。' });
  }
  
  if (!signupId || !['approved', 'rejected'].includes(newStatus)) {
    return res.status(400).json({ message: '无效的请求参数。' });
  }

  try {
    db.prepare(
      "UPDATE signups SET status = ? WHERE id = ?"
    ).run(newStatus, signupId);

    // 如果报名被批准，则为用户增加积分
    if (newStatus === 'approved') {
        const signup = db.prepare("SELECT username FROM signups WHERE id = ?").get(signupId);
        if (signup) {
             db.prepare("UPDATE users SET points = points + 1 WHERE username = ?").run(signup.username);
        }
    }

    res.status(200).json({ message: '报名状态更新成功！' });
  } catch (error) {
    console.error('更新报名状态失败:', error);
    res.status(500).json({ message: '更新过程中发生错误。' });
  }
}