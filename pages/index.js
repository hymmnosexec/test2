// pages/index.js
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useRouter } from 'next/router';

export default function HomePage({ initialActivities }) {
  const [activities, setActivities] = useState(initialActivities || []);
  const router = useRouter();

  const { isLoggedIn, isAdmin, user, logout } = useAuth();

  const handleSignup = async (activityId) => {
    if (!isLoggedIn) {
      alert('请先登录才能报名！');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username, activityId }),
      });

      const result = await res.json();
      alert(result.message);
    } catch (error) {
      console.error('报名失败:', error);
      alert('报名过程中发生错误。');
    }
  };

  useEffect(() => {
    if (initialActivities) return;
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data));
  }, [initialActivities]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">社区志愿活动平台</h1>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">最新活动</h2>
        <div className="space-x-4">
          {!isLoggedIn && (
            <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              登录 / 注册
            </a>
          )}
          {isLoggedIn && (
            <>
              <a href="/user" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                用户中心
              </a>
              <button onClick={async () => {
                  await logout();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                退出登录
              </button>
            </>
          )}
        </div>
      </div>
      {
                <ul className="grid grid-cols-1 md:grid-cols-2">
            {activities.map(activity => (
              <li key={activity.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                {activity.image_url && (
                  <img 
                    src={activity.image_url} 
                    alt={activity.title} 
                    className="w-full h-48 object-cover rounded-md mb-4" 
                  />
                )}
                <h2 className="text-xl font-bold mb-2">{activity.title}</h2>
                <p className="text-gray-600 mb-1">发布者: {activity.creator_username || '未知'}</p>
                <p className="text-gray-600 mb-4">服务时长: {activity.service_hours} 小时</p>
                
                <div className="mt-auto flex justify-between items-center">
                  {isLoggedIn ? (
                    <button
                      onClick={() => handleSignup(activity.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      我要报名
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">登录后报名</span>
                  )}
                  {/* 新增：查看详情按钮 */}
                  <button
                    onClick={() => router.push(`/activities/${activity.id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ml-2"
                  >
                    查看详情
                  </button>
                </div>
              </li>
            ))}
          </ul>
      /* <ul className="space-y-4">
        {activities.map(activity => (
          <li key={activity.id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
            <p className="text-gray-600 mb-2">{activity.description}</p>
            <p className="text-gray-600 mb-2 font-semibold">服务时长：{activity.service_hours} 小时</p>
            <p className="text-gray-600 mb-4 text-sm">发布者：{activity.creator_username || '未知'}</p>
            {isLoggedIn && (
              <button
                onClick={() => handleSignup(activity.id)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                我要报名
              </button>
            )}
            {!isLoggedIn && (
              <button
                onClick={() => handleSignup(activity.id)}
                className="bg-purple-300 text-white px-4 py-2 rounded cursor-not-allowed"
                disabled
              >
                我要报名
              </button>
            )}
          </li>
        ))}
      </ul> */}
    </div>
  );
}

export async function getServerSideProps() {
  const db = (await import('../lib/db')).default;
  const activities = db.prepare("SELECT * FROM activities").all();
  return { props: { initialActivities: activities } };
}