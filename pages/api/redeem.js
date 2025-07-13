import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, rewardId } = req.body;

    const user = db.prepare("SELECT points FROM users WHERE username = ?").get(username);
    const reward = db.prepare("SELECT * FROM rewards WHERE id = ?").get(rewardId);

    if (!user || !reward) {
      return res.status(400).json({ message: "用户或奖品不存在" });
    }

    if (user.points < reward.cost) {
      return res.status(400).json({ message: "积分不足" });
    }

    // 扣除积分 + 记录兑换
    db.prepare("UPDATE users SET points = points - ? WHERE username = ?").run(reward.cost, username);
    db.prepare("INSERT INTO redeems (username, reward_id) VALUES (?, ?)").run(username, rewardId);

    res.status(200).json({ message: "兑换成功" });
  } else {
    res.status(405).end();
  }
}