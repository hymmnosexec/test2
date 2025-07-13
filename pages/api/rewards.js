import db from '../../lib/db';

export default function handler(req, res) {
  const rewards = db.prepare("SELECT * FROM rewards").all();
  res.status(200).json(rewards);
}