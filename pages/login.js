// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, login } = useAuth();

  if (user) {
    if (user.isAdmin) {
      router.push('/admin/review-signups');
    } else {
      router.push('/user');
    }
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
        login(data.user);
        setTimeout(() => {
          if (data.user.isAdmin) {
            router.push('/admin/review-signups');
          } else {
            router.push('/user');
          }
        }, 500);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('登录过程中发生错误。');
      console.error('登录失败:', error);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">登录</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          登录
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center ${message.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
      <div className="mt-4 text-center">
        <p>还没有账户？
          <a href="/register" className="text-blue-500 hover:underline">点击注册</a>
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  if (usernameCookie) {
    const username = usernameCookie.split('=')[1];
    const db = (await import('../lib/db')).default;
    const user = db.prepare("SELECT username FROM users WHERE username = ?").get(username);

    if (user) {
      if (user.username === 'admin') {
        return {
          redirect: {
            destination: '/admin/review-signups',
            permanent: false,
          },
        };
      }
      return {
        redirect: {
          destination: '/user',
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
}