// pages/profile.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function ProfilePage({ initialProfile }) {
  const [profile, setProfile] = useState(initialProfile || { real_name: '', email: '', phone: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({ ...prevProfile, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('正在保存...');

    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, ...profile }),
      });

      const result = await res.json();
      setStatusMessage(result.message);
      
      if (res.ok) {
        // 如果保存成功，跳转回用户中心
        router.push('/user');
      }
    } catch (error) {
      console.error('保存失败:', error);
      setStatusMessage('保存过程中发生错误，请稍后再试。');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">✍️ 个人资料</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">用户名</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none"
            value={user?.username}
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">真实姓名</label>
          <input
            type="text"
            name="real_name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={profile.real_name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">邮箱</label>
          <input
            type="email"
            name="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={profile.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">电话</label>
          <input
            type="tel"
            name="phone"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={profile.phone}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            保存资料
          </button>
          <button
            type="button"
            onClick={() => router.push('/user')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            返回
          </button>
        </div>
        {statusMessage && <p className="mt-4 text-center text-sm">{statusMessage}</p>}
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  if (!usernameCookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  const username = usernameCookie.split('=')[1];
  const db = (await import('../lib/db')).default;

  const profile = db.prepare("SELECT real_name, email, phone FROM users WHERE username = ?").get(username);
  
  return {
    props: {
      initialProfile: profile || null,
    },
  };
}