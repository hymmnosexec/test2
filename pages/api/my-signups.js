import db from '../../lib/db';

export default function handler(req, res) {
  const { username } = req.query;

  const signups = db.prepare(`
    SELECT activities.title, activities.description, signups.signup_time
    FROM signups
    JOIN activities ON signups.activity_id = activities.id
    WHERE signups.username = ?
    ORDER BY signups.signup_time DESC
  `).all(username);

  const user = db.prepare(`
    SELECT points FROM users WHERE username = ?
  `).get(username);

  res.status(200).json({
    signups,
    points: user ? user.points : 0
  });
}
// import db from '../../lib/db';

// export default function handler(req, res) {
//   const { username } = req.query;
// const rows = db.prepare(`
//   SELECT activities.title, activities.description, signups.signup_time
//   FROM signups
//   JOIN activities ON signups.activity_id = activities.id
//   WHERE signups.username = ?
//   ORDER BY signups.signup_time DESC
// `).all(username);
//   res.status(200).json(rows);
// }
