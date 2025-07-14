// pages/api/manage-activity.js
import db from '../../lib/db';
import { serialize } from 'cookie';

export default function handler(req, res) {
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return res.status(403).json({ message: '无权限操作。' });
  }

  if (req.method === 'DELETE') {
    const { activityId } = req.body;
    if (!activityId) {
      return res.status(400).json({ message: '缺少活动ID。' });
    }
    
    // 使用事务确保数据完整性
    const deleteTransaction = db.transaction(() => {
      // 1. 先删除所有相关的报名记录
      const deleteSignups = db.prepare("DELETE FROM signups WHERE activity_id = ?");
      deleteSignups.run(activityId);

      // 2. 然后删除活动本身
      const deleteActivity = db.prepare("DELETE FROM activities WHERE id = ?");
      const result = deleteActivity.run(activityId);
      
      return result;
    });

    try {
      const result = deleteTransaction();
      
      if (result.changes === 0) {
        return res.status(404).json({ message: '未找到要删除的活动。' });
      }

      return res.status(200).json({ message: '活动删除成功！' });
    } catch (error) {
      console.error('删除活动时发生错误:', error);
      return res.status(500).json({ message: '删除活动时发生错误。' });
    }
  }

  res.status(405).end();
}