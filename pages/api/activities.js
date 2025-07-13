import db from '../../lib/db';

export default function handler(req, res) {
  const activities = db.prepare("SELECT * FROM activities").all();
  res.status(200).json(activities);
}
