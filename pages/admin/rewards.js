// pages/admin/rewards.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import Head from 'next/head';

export default function AdminRewardsPage({ rewards: initialRewards }) {
  const [rewards, setRewards] = useState(initialRewards);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();
  const { user } = useAuth();
  
  if (!user || !user.isAdmin) {
    return <div className="text-center p-8">无权限访问此页面。</div>;
  }

  const handleAddReward = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cost: parseInt(cost), description, image_url: imageUrl }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        // 新增：使用后端返回的 rewardId
        setRewards([...rewards, { 
          id: data.rewardId, // 确保新商品有ID
          name, 
          cost: parseInt(cost), 
          description, 
          image_url: imageUrl 
        }]);
        setName('');
        setCost('');
        setDescription('');
        setImageUrl('');
      }
    } catch (error) {
      setMessage('添加失败。');
      console.error('添加失败:', error);
    }
  };
  
  const handleDeleteReward = async (rewardId) => {
    setMessage('');
    if (!window.confirm('确定要删除此商品吗？')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rewardId }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setRewards(rewards.filter(r => r.id !== rewardId));
      }
    } catch (error) {
      setMessage('删除失败。');
      console.error('删除失败:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Head>
        <title>管理积分商城</title>
      </Head>
      <h1 className="text-2xl font-bold mb-6">管理积分商城</h1>
      
      {/* 添加新商品的表单 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">添加新商品</h2>
        <form onSubmit={handleAddReward} className="space-y-4">
          <div>
            <label className="block text-gray-700">商品名称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-gray-700">所需积分</label>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-gray-700">商品描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" rows="3" />
          </div>
          <div>
            <label className="block text-gray-700">图片 URL</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            添加商品
          </button>
        </form>
      </div>
      
      {message && (
        <p className={`mt-4 text-center ${message.includes('失败') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}

            {/* 现有商品列表 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">现有商品</h2>
        <ul className="space-y-4">
          {rewards.map(reward => (
            <li key={reward.id} className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {reward.image_url && (
                  <img
                    src={reward.image_url}
                    alt={reward.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold">{reward.name}</h3>
                  <p className="text-gray-600">积分：{reward.cost}</p>
                  <p className="text-gray-600 text-sm">{reward.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteReward(reward.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
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

  const db = (await import('../../lib/db')).default;
  const rewards = db.prepare("SELECT * FROM rewards").all();

  return {
    props: {
      rewards,
    },
  };
}