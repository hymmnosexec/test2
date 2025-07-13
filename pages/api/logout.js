// pages/api/logout.js
import { serialize } from 'cookie';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', serialize('username', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: -1,
    path: '/',
  }));

  res.status(200).json({ message: '退出登录成功。' });
}