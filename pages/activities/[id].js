// pages/activities/[id].js
import { useRouter } from 'next/router';
import db from '../../lib/db'; // 引入数据库
import useAuth from '../../hooks/useAuth'; // 如果需要登录/报名功能

export default function ActivityDetailPage({ activity }) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth(); // 获取登录状态和用户信息

  if (router.isFallback) {
    return <div className="text-center p-8">加载中...</div>;
  }

  if (!activity) {
    return <div className="text-center p-8 text-red-500">活动未找到。</div>;
  }

  // 假设报名API是 /api/signup
  const handleSignup = async () => {
    if (!isLoggedIn) {
      alert('请先登录才能报名活动！');
      router.push('/login');
      return;
    }

    if (activity.creator_username === user.username) {
      alert('您是活动的发布者，无需报名！');
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, activity_id: activity.id }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        // 报名成功后，可以刷新页面或更新UI
        // router.replace(router.asPath); // 刷新当前页面获取最新状态
      }
    } catch (error) {
      console.error('报名失败:', error);
      alert('报名过程中发生错误。');
    }
  };


  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
      
      {activity.image_url && (
        <img 
          src={activity.image_url} 
          alt={activity.title} 
          className="w-full h-80 object-cover rounded-md mb-6" 
        />
      )}

      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{activity.description}</p> {/* 使用 whitespace-pre-wrap 保留换行 */}
      <p className="text-gray-600 mb-2">
        **服务时长:** {activity.service_hours} 小时
      </p>
      <p className="text-gray-600 mb-4">
        **发布者:** {activity.creator_username || '未知'}
      </p>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          返回
        </button>
        {isLoggedIn ? (
          <button
            onClick={handleSignup}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            我要报名此活动
          </button>
        ) : (
          <span className="text-sm text-gray-500">登录后才能报名</span>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const activity = db.prepare("SELECT * FROM activities WHERE id = ?").get(id);

  if (!activity) {
    return {
      notFound: true, // 如果活动不存在，返回404页面
    };
  }

  return {
    props: {
      activity,
    },
  };
}