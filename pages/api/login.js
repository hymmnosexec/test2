// pages/api/login.js
import db from '../../lib/db';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username, password } = req.body;
  
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);

  if (user) {
    // 登录成功，设置cookie
    res.setHeader('Set-Cookie', serialize('username', username, {
      httpOnly: false,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7, // 1周
      path: '/',
    }));
    
    // 返回用户信息，包括角色
    res.status(200).json({
        message: '登录成功。',
        user: {
            username: user.username,
            isAdmin: user.username === 'admin', // 新增 isAdmin 字段
        }
    });
  } else {
    res.status(401).json({ message: '用户名或密码不正确。' });
  }
}