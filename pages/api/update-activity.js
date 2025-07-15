// pages/api/update-activity.js
import db from '../../lib/db';

export default function handler(req, res) {
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  // 权限检查：只有管理员才能更新活动
  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return res.status(403).json({ message: '无权限操作。' });
  }

  if (req.method === 'PUT') {
    const { id, title, description, service_hours, image_url, creator_username } = req.body;

    if (!id || !title || !description || service_hours === undefined || !creator_username) {
      return res.status(400).json({ message: '所有字段都是必填项。' });
    }

    try {
      // 额外检查：确保只有活动发布者本人才能修改
      const existingActivity = db.prepare("SELECT creator_username FROM activities WHERE id = ?").get(id);
      if (!existingActivity || existingActivity.creator_username !== creator_username) {
        return res.status(403).json({ message: '您无权修改此活动。' });
      }

      db.prepare(
        `UPDATE activities SET title = ?, description = ?, service_hours = ?, image_url = ? WHERE id = ? AND creator_username = ?`
      ).run(title, description, service_hours, image_url, id, creator_username);

      return res.status(200).json({ message: '活动更新成功！' });
    } catch (error) {
      console.error('更新活动失败:', error);
      return res.status(500).json({ message: '更新活动时发生错误。' });
    }
  }

  res.status(405).end(); // 只允许 PUT 方法
}