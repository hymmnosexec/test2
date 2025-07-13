// pages/user.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function UserCenter({ initialPoints }) {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [points, setPoints] = useState(initialPoints);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetch(`/api/my-signups?username=${user.username}`)
        .then(res => res.json())
        .then(data => {
          setPoints(data.points);
        });
    }
  }, [isLoggedIn, user]);

  if (initialPoints === undefined) {
    return <div className="text-center p-6">正在加载中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">👤 用户中心</h1>
      <p className="mb-2">当前用户：<strong>{user?.username}</strong></p>
      <p className="mb-4">当前积分：{points}</p>

      <div className="space-x-4 mb-4">
        {/* 新增：个人资料链接 */}
        <a href="/profile" className="text-blue-600 underline">个人资料</a>
        <a href="/my-signups" className="text-blue-600 underline">我的报名记录</a>
        <a href="/rewards" className="text-blue-600 underline">积分兑换</a>
        {isAdmin && (
          <>
            <a href="/add-activity" className="text-red-500 underline">添加活动</a>
            <a href="/api/init-rewards" className="text-red-500 underline">添加默认奖品</a>
          </>
        )}
      </div>

      <div className="mt-4 space-x-4">
        <button onClick={() => router.push('/')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          返回主页
        </button>
        <button onClick={async () => {
          await logout();
          router.push('/');
        }} 
        className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          退出登录
        </button>
      </div>
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
  const user = db.prepare("SELECT points FROM users WHERE username = ?").get(username);

  return {
    props: {
      initialPoints: user ? user.points : 0,
    },
  };
}