// pages/my-signups.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

const statusMap = {
  'pending': '待审核',
  'approved': '已批准',
  'rejected': '已拒绝',
};

export default function MySignups({ initialSignups, initialPoints }) {
  const [signups, setSignups] = useState(initialSignups);
  const router = useRouter();

  const getPoints = () => {
    return initialPoints;
  }

  // 格式化日期，只在客户端运行
  useEffect(() => {
    setSignups(prevSignups => prevSignups.map(signup => ({
      ...signup,
      formattedTime: new Date(signup.signup_time).toLocaleString(),
    })));
  }, [initialSignups]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">我的报名记录</h1>
        <p>当前积分：<strong>{getPoints()}</strong></p>
      </div>

      <ul className="space-y-4">
        {signups.length > 0 ? (
          signups.map(signup => (
            <li key={signup.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{signup.title}</h3>
              {/* 使用 useEffect 中设置的格式化时间 */}
              <p className="text-gray-600 mb-2">报名时间：{signup.formattedTime || '加载中...'}</p>
              <p className="text-sm font-bold">状态：<span className={`
                ${signup.status === 'pending' ? 'text-yellow-600' : ''}
                ${signup.status === 'approved' ? 'text-green-600' : ''}
                ${signup.status === 'rejected' ? 'text-red-600' : ''}
              `}>{statusMap[signup.status] || signup.status}</span></p>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500">你还没有报名任何活动。</li>
        )}
      </ul>

      <div className="mt-6 text-center">
        <button onClick={() => router.back()} className="bg-blue-500 text-white px-4 py-2 rounded">
          返回
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
  const signups = db.prepare(
    `SELECT s.id, s.signup_time, a.title, s.status
     FROM signups s 
     JOIN activities a ON s.activity_id = a.id 
     WHERE s.username = ?`
  ).all(username);

  return {
    props: {
      initialSignups: signups,
      initialPoints: user ? user.points : 0
    }
  };
}