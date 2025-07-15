// pages/api/update-profile.js
import db from '../../lib/db';
// import { serialize } from 'cookie'; // 移除这行，因为这里不需要操作 cookie，只需要读取

export default function handler(req, res) {
  const cookies = req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));
  const loggedInUsername = usernameCookie ? usernameCookie.split('=')[1] : null;

  // 1. **权限检查：确保用户已登录**
  if (!loggedInUsername) {
    return res.status(401).json({ message: '请先登录。' });
  }

  // 2. **修正 HTTP 方法为 PUT**
  if (req.method === 'PUT') {
    const { username, real_name, email, phone } = req.body;
    
    // 3. **安全性检查：确保用户只能修改自己的资料**
    if (username !== loggedInUsername) {
      return res.status(403).json({ message: '无权限修改他人资料。' });
    }

    // 确保用户名存在，防止恶意更新（这里的 username 现在是经过权限验证的）
    if (!username) { // 理论上这里不会被触发，因为上面 loggedInUsername 已经做了检查
        return res.status(400).json({ message: '用户名缺失。' });
    }

    try {
      const info = db.prepare(
        `UPDATE users 
          SET real_name = ?, email = ?, phone = ? 
          WHERE username = ?`
      ).run(real_name, email, phone, username);

      if (info.changes > 0) {
        return res.status(200).json({ message: '个人资料更新成功！' });
      } else {
        // 如果没有行被更新，可能是提交的数据与现有数据相同，或者用户名不存在（在上面已经验证了用户名）
        return res.status(200).json({ message: '个人资料没有变化，无需更新。' });
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      res.status(500).json({ message: '更新个人资料时发生错误。' });
    }
  } else {
    res.status(405).end(); // 只接受 PUT 请求
  }
}
// // pages/api/update-profile.js
// import db from '../../lib/db';
// import { serialize } from 'cookie';

// export default function handler(req, res) {
//   if (req.method === 'POST') {
//     const { username, real_name, email, phone } = req.body;
    
//     // 确保用户名存在，防止恶意更新
//     if (!username) {
//         return res.status(400).json({ message: '用户名缺失。' });
//     }

//     try {
//       db.prepare(
//         `UPDATE users 
//          SET real_name = ?, email = ?, phone = ? 
//          WHERE username = ?`
//       ).run(real_name, email, phone, username);

//       res.status(200).json({ message: '个人资料更新成功！' });
//     } catch (error) {
//       console.error('更新个人资料失败:', error);
//       res.status(500).json({ message: '更新个人资料时发生错误。' });
//     }
//   } else {
//     res.status(405).end(); // 只接受 POST 请求
//   }
// }