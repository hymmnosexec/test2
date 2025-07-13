// .../pages/login.js
// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const { isLoggedIn } = useAuth();
  if (isLoggedIn) {
    // 如果已经登录，直接跳转到用户中心
    router.push('/user');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        // 根据用户的角色进行不同的跳转
        if (data.user.isAdmin) {
          router.push('/admin/review-signups');
        } else {
          router.push('/user');
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('登录过程中发生错误。');
      console.error('登录失败:', error);
    }
  };
  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded"> 
      <h1 className="text-2xl font-bold mb-4">登录社区志愿服务平台</h1> 
      <form onSubmit={handleLogin}>
        <input
          className="border p-2 w-full mb-4 rounded"
          placeholder="请输入用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required // 标记为必填
        />
        <input
          className="border p-2 w-full mb-4 rounded"
          type="password" // 设置为密码类型
          placeholder="请输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required // 标记为必填
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit"> [cite: 33]
          登录
        </button>
      </form>
    </div>
  );
}
// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import Cookies from 'js-cookie';

// export default function LoginPage() {
//   const [username, setUsername] = useState('');
//   const router = useRouter();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (!username) return;

//     Cookies.set('username', username);
//     router.push('/user');
//   };

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
//       <h1 className="text-2xl font-bold mb-4">登录社区志愿服务平台</h1>
//       <form onSubmit={handleLogin}>
//         <input
//           className="border p-2 w-full mb-4 rounded"
//           placeholder="请输入用户名"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
//           登录
//         </button>
//       </form>
//     </div>
//   );
// }
