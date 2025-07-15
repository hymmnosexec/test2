// pages/api/redeem.js
import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const cookies = req.headers.cookie;
    const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));
    const username = usernameCookie ? usernameCookie.split('=')[1] : null;

    if (!username) {
        return res.status(401).json({ message: "请先登录" });
    }

    const { rewardId } = req.body;

    try {
      const user = db.prepare("SELECT points FROM users WHERE username = ?").get(username);
      const reward = db.prepare("SELECT * FROM rewards WHERE id = ?").get(rewardId);

      if (!user || !reward) {
        return res.status(400).json({ message: "用户或奖品不存在" });
      }

      if (user.points < reward.cost) {
        return res.status(400).json({ message: "积分不足" });
      }

      // 使用事务确保操作的原子性：扣除积分和记录兑换要么都成功，要么都失败
      const redeemTransaction = db.transaction(() => {
        // 扣除积分
        db.prepare("UPDATE users SET points = points - ? WHERE username = ?").run(reward.cost, username);
        console.log(`User ${username} points deducted by ${reward.cost}. New points: ${user.points - reward.cost}`);

        // 记录兑换
        db.prepare("INSERT INTO redeems (username, reward_id) VALUES (?, ?)").run(username, rewardId);
        console.log(`Redemption recorded for user ${username}, reward ID ${rewardId}`);
      });

      redeemTransaction(); // 执行事务

      res.status(200).json({ message: "兑换成功！" });

    } catch (error) {
      console.error('兑换过程中发生错误:', error); // 打印详细错误信息到服务器终端
      return res.status(500).json({ message: "兑换过程中发生错误。" });
    }
  } else {
    res.status(405).end(); // 不支持其他请求方法
  }
}