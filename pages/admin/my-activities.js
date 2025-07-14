// pages/admin/my-activities.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';

export default function MyActivities({ initialActivities }) {
  const [activities, setActivities] = useState(initialActivities);
  const router = useRouter();

  const handleDelete = async (activityId) => {
    if (!confirm("确定要删除此活动吗？此操作不可逆。")) {
      return;
    }

    try {
      const res = await fetch('/api/manage-activity', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId }),
      });

      const result = await res.json();
      alert(result.message);

      if (res.ok) {
        // 更新本地状态，移除已删除的活动
        setActivities(prevActivities => prevActivities.filter(a => a.id !== activityId));
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除过程中发生错误。');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔑 管理员：我发布的活动</h1>

      {activities.length > 0 ? (
        <ul className="space-y-4">
          {activities.map(activity => (
            <li key={activity.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
              <p className="text-gray-600 mb-2">服务时长：{activity.service_hours} 小时</p>
              <div className="mt-4">
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  删除活动
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-6 text-gray-500">
          <p>你还没有发布任何活动。</p>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <button onClick={() => router.push('/')} className="bg-blue-500 text-white px-4 py-2 rounded">
          返回主页
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));
  
  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const username = usernameCookie.split('=')[1];
  const db = (await import('../../lib/db')).default;
  const myActivities = db.prepare(
    `SELECT * FROM activities WHERE creator_username = ?`
  ).all(username);

  return {
    props: {
      initialActivities: myActivities,
    },
  };
}