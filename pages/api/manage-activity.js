// pages/api/manage-activity.js
import db from '../../lib/db';

export default function handler(req, res) {
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  // 权限检查：只有管理员才能操作
  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return res.status(403).json({ message: '无权限操作。' });
  }

  // 处理 DELETE 请求
  if (req.method === 'DELETE') {
    // 调试：打印请求体，查看是否收到 id
    console.log('DELETE request body:', req.body); 

    const { id, creator_username } = req.body; // 确保正确解构 id 和 creator_username

    if (!id) {
      console.error('DELETE error: Missing activity ID in request body.');
      return res.status(400).json({ message: '缺少活动ID。' }); // 这个就是你看到的错误信息
    }
    if (!creator_username) {
        console.error('DELETE error: Missing creator_username in request body.');
        return res.status(400).json({ message: '缺少发布者信息。' });
    }

    try {
      // 首先检查活动是否存在且属于当前管理员
      const existingActivity = db.prepare("SELECT creator_username FROM activities WHERE id = ?").get(id);

      if (!existingActivity) {
        console.warn(`Attempted to delete non-existent activity with ID: ${id}`);
        return res.status(404).json({ message: '未找到要删除的活动。' });
      }

      if (existingActivity.creator_username !== creator_username) {
        console.warn(`User ${creator_username} attempted to delete activity ${id} not created by them.`);
        return res.status(403).json({ message: '您无权删除此活动。' });
      }

      // 开始事务，确保删除操作的原子性
      const deleteTransaction = db.transaction(() => {
        // 删除所有关联的报名记录
        db.prepare(`DELETE FROM signups WHERE activity_id = ?`).run(id);
        console.log(`Deleted signups for activity ID: ${id}`);

        // 删除活动本身
        const info = db.prepare(`DELETE FROM activities WHERE id = ?`).run(id);
        console.log(`Deleted activity ID: ${id}, changes: ${info.changes}`);

        return info.changes;
      });

      const changes = deleteTransaction();

      if (changes === 0) {
        return res.status(404).json({ message: '未找到要删除的活动。' });
      }

      return res.status(200).json({ message: '活动删除成功！' });

    } catch (error) {
      console.error('删除活动失败:', error);
      return res.status(500).json({ message: '删除活动时发生错误。' });
    }
  }
  
  res.status(405).end(); // 不支持的方法
}

