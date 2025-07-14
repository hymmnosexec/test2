// pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password, 
          real_name: realName, 
          email, 
          phone 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message + '即将跳转到用户中心...');
        login(data.user);
        setTimeout(() => {
          router.push('/user');
        }, 1500);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('注册过程中发生错误。');
      console.error('注册失败:', error);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">注册新账户</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-gray-700">用户名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">密码 <span className="text-red-500">*</span></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">真实姓名</label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">电话</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          注册
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center ${message.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
      <div className="mt-4 text-center">
        <p>已有账户？
          <a href="/login" className="text-blue-500 hover:underline">点击登录</a>
        </p>
      </div>
    </div>
  );
}