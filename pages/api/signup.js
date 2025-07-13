// pages/api/signup.js
import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // 只接受POST请求
  }

  const { username, activityId } = req.body;

  // 检查是否已报名
  const existingSignup = db.prepare(
    "SELECT id FROM signups WHERE username = ? AND activity_id = ?"
  ).get(username, activityId);

  if (existingSignup) {
    return res.status(409).json({ message: '你已经报名过此活动了。' });
  }

  try {
    // 插入新记录，并设置 status 为 'pending'（待审核）
    const info = db.prepare(
      `INSERT INTO signups (username, activity_id, status) VALUES (?, ?, ?)`
    ).run(username, activityId, 'pending');

    res.status(200).json({ 
      message: '报名成功！你的申请已提交，等待管理员审核。',
      signupId: info.lastInsertRowid 
    });
  } catch (error) {
    console.error('报名失败:', error);
    res.status(500).json({ message: '报名过程中发生错误。' });
  }
}