// pages/admin/review-signups.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminReviewPage({ initialSignups }) {
  const [signups, setSignups] = useState(initialSignups);
  const router = useRouter();

  // 格式化日期，只在客户端运行
  useEffect(() => {
    setSignups(prevSignups => prevSignups.map(signup => ({
      ...signup,
      formattedTime: new Date(signup.signup_time).toLocaleString(),
    })));
  }, [initialSignups]);

  const handleReview = async (signupId, status) => {
    try {
      const res = await fetch('/api/manage-signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupId, newStatus: status }),
      });

      const result = await res.json();
      alert(result.message);

      if (res.ok) {
        setSignups(prevSignups => prevSignups.filter(s => s.id !== signupId));
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作过程中发生错误。');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔑 管理员：审核报名</h1>

      {signups.length > 0 ? (
        <ul className="space-y-4">
          {signups.map(signup => (
            <li key={signup.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{signup.activity_title}</h3>
              <p className="text-gray-600 mb-2">报名人：<strong>{signup.username}</strong></p>
              
              {/* 新增：显示用户的个人资料 */}
              <div className="text-sm mb-4">
                <p>姓名：{signup.real_name || '未填写'}</p>
                <p>邮箱：{signup.email || '未填写'}</p>
                <p>电话：{signup.phone || '未填写'}</p>
              </div>

              <p className="text-gray-600 mb-4">申请时间：{signup.formattedTime || '加载中...'}</p>
              <div className="space-x-4">
                <button
                  onClick={() => handleReview(signup.id, 'approved')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  批准
                </button>
                <button
                  onClick={() => handleReview(signup.id, 'rejected')}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  拒绝
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-6 text-gray-500">
          <p>当前没有待审核的报名申请。</p>
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
  
  if (!usernameCookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const username = usernameCookie.split('=')[1];
  if (username !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const db = (await import('../../lib/db')).default;
  const pendingSignups = db.prepare(
    `SELECT 
       s.id, 
       s.signup_time, 
       s.username, 
       a.title as activity_title,
       u.real_name,
       u.email,
       u.phone
     FROM signups s 
     JOIN activities a ON s.activity_id = a.id 
     JOIN users u ON s.username = u.username
     WHERE s.status = 'pending'`
  ).all();

  return {
    props: {
      initialSignups: pendingSignups,
    },
  };
}