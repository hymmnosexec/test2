// pages/add-activity.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function AddActivity() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [serviceHours, setServiceHours] = useState(0);
  const [imageUrl, setImageUrl] = useState(''); // 新增：图片 URL 状态
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { isLoggedIn, isAdmin, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isLoggedIn || !isAdmin) {
      setMessage('无权限操作。');
      return;
    }

    try {
      const res = await fetch('/api/add-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          service_hours: parseInt(serviceHours),
          creator_username: user.username,
          image_url: imageUrl // 新增：发送图片 URL
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTitle('');
        setDescription('');
        setServiceHours(0);
        setImageUrl(''); // 清空图片 URL
        router.push('/admin/my-activities');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('添加活动时发生错误。');
      console.error('添加活动失败:', error);
    }
  };

  if (!isLoggedIn || !isAdmin) {
    return <div className="text-center p-6 text-red-500">无权限访问此页面。</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">✨ 添加新活动</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">活动标题</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">活动描述</label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">志愿服务时长 (小时)</label>
          <input
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={serviceHours}
            onChange={(e) => setServiceHours(e.target.value)}
            required
            min="0"
          />
        </div>
        {/* 新增：图片 URL 输入框 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">图片 URL (可选)</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="例如: https://example.com/activity.jpg"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            添加活动
          </button>
        </div>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}