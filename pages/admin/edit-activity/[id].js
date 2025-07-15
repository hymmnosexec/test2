// pages/admin/edit-activity/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../../../hooks/useAuth';
import db from '../../../lib/db'; // 引入数据库

export default function EditActivityPage({ activity: initialActivity }) {
  const router = useRouter();
  const { id } = router.query; // 从路由获取活动ID
  const { user, isAdmin } = useAuth();

  const [title, setTitle] = useState(initialActivity?.title || '');
  const [description, setDescription] = useState(initialActivity?.description || '');
  const [serviceHours, setServiceHours] = useState(initialActivity?.service_hours || 0);
  const [imageUrl, setImageUrl] = useState(initialActivity?.image_url || '');
  const [message, setMessage] = useState('');

  // 如果 initialActivity 为空，表示活动不存在或加载失败
  useEffect(() => {
    if (!initialActivity && !router.isFallback) {
      setMessage('活动未找到或加载失败。');
    }
  }, [initialActivity, router.isFallback]);

  if (!user || !isAdmin) {
    return <div className="text-center p-8">无权限访问此页面。</div>;
  }

  if (router.isFallback) {
    return <div className="text-center p-8">加载中...</div>;
  }

  if (!initialActivity) {
    return <div className="text-center p-8 text-red-500">{message}</div>;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/update-activity', {
        method: 'PUT', // 使用 PUT 请求更新
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: initialActivity.id, // 传递活动ID
          title,
          description,
          service_hours: parseInt(serviceHours),
          image_url: imageUrl,
          creator_username: user.username // 再次验证发布者
        }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        // 更新成功后，可以跳转回“我发布的活动”页面
        setTimeout(() => {
          router.push('/admin/my-activities');
        }, 1500);
      }
    } catch (error) {
      setMessage('更新失败。');
      console.error('更新失败:', error);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg my-8">
      <h1 className="text-2xl font-bold mb-4 text-center">修改活动: {initialActivity.title}</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-gray-700">活动标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">活动描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">服务时长 (小时)</label>
          <input
            type="number"
            value={serviceHours}
            onChange={(e) => setServiceHours(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-gray-700">图片 URL (可选)</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="例如: https://example.com/activity.jpg"
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            保存修改
          </button>
        </div>
      </form>
      {message && (
        <p className={`mt-4 text-center ${message.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const cookies = context.req.headers.cookie;
  const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

  // 权限检查
  if (!usernameCookie || usernameCookie.split('=')[1] !== 'admin') {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const activity = db.prepare("SELECT * FROM activities WHERE id = ?").get(id);

  if (!activity) {
    return {
      notFound: true, // 如果活动不存在，返回404页面
    };
  }

  return {
    props: {
      activity: JSON.parse(JSON.stringify(activity)), // 确保数据可序列化
    },
  };
}