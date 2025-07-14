// pages/api/register.js
import db from '../../lib/db';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username, password, real_name, email, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码是必填项。' });
  }

  try {
    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT username FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(409).json({ message: '该用户名已存在。' });
    }

    // 插入新用户
    const info = db.prepare(
      `INSERT INTO users (username, password, real_name, email, phone) VALUES (?, ?, ?, ?, ?)`
    ).run(username, password, real_name, email, phone);

    // 注册成功后，自动登录用户
    const cookie = serialize('username', username, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
    });
    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      message: '注册成功！正在为您自动登录...',
      user: {
        username: username,
        isAdmin: username === 'admin'
      }
    });

  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({ message: '注册时发生错误。' });
  }
}