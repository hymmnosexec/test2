// pages/admin/all-redeems.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';

export default function AllRedeemsPage() {
  const [redeems, setRedeems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchAllRedeems = async () => {
      if (!isAdmin) {
        setLoading(false);
        setError('无权限访问此页面。');
        router.push('/login'); // 非管理员则跳转到登录页
        return;
      }

      try {
        // 管理员获取所有兑换记录，不传username参数
        const res = await fetch('/api/get-redeems');
        const data = await res.json();

        if (res.ok) {
          setRedeems(data.redeems);
        } else {
          setError(data.message || '获取所有兑换记录失败。');
        }
      } catch (err) {
        console.error('Failed to fetch all redeems:', err);
        setError('加载兑换记录时发生网络错误。');
      } finally {
        setLoading(false);
      }
    };

    fetchAllRedeems();
  }, [isAdmin, router]); // 依赖项确保在管理员状态变化时重新获取

  if (loading) {
    return <div className="text-center p-8">加载中...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-2xl font-bold mb-6 text-center">所有兑换记录</h1>

      {!isAdmin ? (
        <p className="text-center text-red-500">无权限访问此页面。</p>
      ) : redeems.length === 0 ? (
        <p className="text-center text-gray-500">目前还没有任何兑换记录。</p>
      ) : (
        <ul className="space-y-4">
          {redeems.map((redeem) => (
            <li key={redeem.id} className="bg-gray-50 p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold text-lg">{redeem.reward_name}</span>
                  <p className="text-gray-700 text-sm">兑换用户: {redeem.username}</p>
                </div>
                <span className="text-gray-600">消耗积分: {redeem.cost}</span>
              </div>
              <p className="text-gray-500 text-sm">兑换时间: {new Date(redeem.redeem_time).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          返回
        </button>
      </div>
    </div>
  );
}