// pages/api/logout.js
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  // 删除 cookie
  const cookie = serialize('username', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0) // 设置过期时间为过去
  });
  
  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ message: '成功退出登录。' });
}