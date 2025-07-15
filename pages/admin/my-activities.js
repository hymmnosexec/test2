// // pages/admin/my-activities.js
// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import useAuth from '../../hooks/useAuth';

// export default function MyActivities({ initialActivities }) {
//   const [activities, setActivities] = useState(initialActivities);
//   const router = useRouter();

//   const handleDelete = async (activityId) => {
//     if (!confirm("确定要删除此活动吗？此操作不可逆。")) {
//       return;
//     }

//     try {
//       const res = await fetch('/api/manage-activity', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ activityId }),
//       });

//       const result = await res.json();
//       alert(result.message);

//       if (res.ok) {
//         // 更新本地状态，移除已删除的活动
//         setActivities(prevActivities => prevActivities.filter(a => a.id !== activityId));
//       }
//     } catch (error) {
//       console.error('删除失败:', error);
//       alert('删除过程中发生错误。');
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">🔑 管理员：我发布的活动</h1>

//       {activities.length > 0 ? (
//         <ul className="space-y-4">
//           {activities.map(activity => (
//             <li key={activity.id} className="p-4 border rounded-lg shadow-sm">
//               <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
//               <p className="text-gray-600 mb-2">服务时长：{activity.service_hours} 小时</p>
//               <div className="mt-4">
//                 <button
//                   onClick={() => router.push(`/admin/edit-activity/${activity.id}`)}
//                   className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
//                 >
//                   修改
//                 </button>
//                 <button
//                   onClick={() => handleDelete(activity.id)}
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                 >
//                   删除活动
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <div className="text-center p-6 text-gray-500">
//           <p>你还没有发布任何活动。</p>
//         </div>
//       )}
      
//       <div className="mt-6 text-center">
//         <button onClick={() => router.push('/')} className="bg-blue-500 text-white px-4 py-2 rounded">
//           返回主页
//         </button>
//       </div>
//     </div>
//   );
// }

// export async function getServerSideProps(context) {
//   const cookies = context.req.headers.cookie;
//   const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));
  
//   if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
//     return {
//       redirect: {
//         destination: '/login',
//         permanent: false,
//       },
//     };
//   }

//   const username = usernameCookie.split('=')[1];
//   const db = (await import('../../lib/db')).default;
//   const myActivities = db.prepare(
//     `SELECT * FROM activities WHERE creator_username = ?`
//   ).all(username);

//   return {
//     props: {
//       initialActivities: myActivities,
//     },
//   };
// }

// pages/admin/my-activities.js (只修改活动列表部分)
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import db from '../../lib/db'; // 确保引入了db

export default function MyActivities({ activities: initialActivities }) {
  const [activities, setActivities] = useState(initialActivities);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <div className="text-center p-8">无权限访问此页面。</div>;
  }

  const handleDelete = async (activityId) => {
    if (!window.confirm('确定要删除此活动吗？删除后所有相关报名记录也将被删除。')) {
      return;
    }

    try {
      const res = await fetch('/api/manage-activity', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: activityId, creator_username: user.username }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setActivities(activities.filter(activity => activity.id !== activityId));
      }
    } catch (error) {
      setMessage('删除失败。');
      console.error('删除失败:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">我发布的活动</h1>

      {message && (
        <p className={`mt-4 text-center ${message.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      {activities.length === 0 ? (
        <p className="text-center text-gray-500">您还没有发布任何活动。</p>
      ) : (
        <ul className="space-y-4">
          {activities.map(activity => (
            <li key={activity.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{activity.title}</h2>
                <p className="text-gray-600 text-sm">服务时长: {activity.service_hours} 小时</p>
              </div>
              <div className="flex space-x-2">
                {/* 新增：修改按钮 */}
                <button
                  onClick={() => router.push(`/admin/edit-activity/${activity.id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  修改
                </button>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/add-activity')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          添加新活动
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
  const activities = db.prepare("SELECT * FROM activities WHERE creator_username = ?").all(username);

  return {
    props: {
      activities: JSON.parse(JSON.stringify(activities)), // 确保数据可序列化
    },
  };
}