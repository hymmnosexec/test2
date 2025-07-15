// pages/api/get-redeems.js
import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { username } = req.query; // 从查询参数中获取 username

    const cookies = req.headers.cookie;
    const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));
    const loggedInUsername = usernameCookie ? usernameCookie.split('=')[1] : null;

    if (!loggedInUsername) {
      return res.status(401).json({ message: '请先登录。' });
    }

    let redeems = [];
    try {
      if (username) {
        // 普通用户请求自己的兑换记录，需要验证身份
        if (username !== loggedInUsername) {
          return res.status(403).json({ message: '无权限查看他人兑换记录。' });
        }
        redeems = db.prepare(`
          SELECT r.id, r.username, r.redeem_time, rw.name AS reward_name, rw.cost
          FROM redeems r
          JOIN rewards rw ON r.reward_id = rw.id
          WHERE r.username = ?
          ORDER BY r.redeem_time DESC
        `).all(username);
      } else {
        // 管理员请求所有兑换记录
        if (loggedInUsername !== 'admin') {
          return res.status(403).json({ message: '无权限查看所有兑换记录。' });
        }
        redeems = db.prepare(`
          SELECT r.id, r.username, r.redeem_time, rw.name AS reward_name, rw.cost
          FROM redeems r
          JOIN rewards rw ON r.reward_id = rw.id
          ORDER BY r.redeem_time DESC
        `).all();
      }
      return res.status(200).json({ redeems });
    } catch (error) {
      console.error('获取兑换记录失败:', error);
      return res.status(500).json({ message: '获取兑换记录时发生错误。' });
    }
  }
  res.status(405).end();
}