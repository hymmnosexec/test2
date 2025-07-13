// pages/rewards.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function RewardsPage({ initialRewards, initialPoints }) {
  const [rewards, setRewards] = useState(initialRewards);
  const { user } = useAuth();
  const router = useRouter();

  const handleRedeem = async (rewardId, cost) => {
    if (!user) {
      alert("请先登录！");
      return;
    }

    if (initialPoints < cost) {
      alert("积分不足，无法兑换！");
      return;
    }

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, rewardId }),
      });
      const result = await res.json();
      alert(result.message);
      if (res.ok) {
        router.reload(); // 兑换成功后刷新页面以更新积分
      }
    } catch (error) {
      console.error('兑换请求失败:', error);
      alert('兑换过程中发生错误。');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🏆 积分商城</h1>
      <p className="text-lg mb-4">当前积分：<strong>{initialPoints}</strong></p>

      <ul className="space-y-4">
        {rewards.length > 0 ? (
          rewards.map(reward => (
            <li key={reward.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{reward.name}</h3>
              <p className="text-gray-600 mb-4">所需积分：{reward.cost}</p>
              <button onClick={() => handleRedeem(reward.id, reward.cost)} className="bg-green-500 text-white px-4 py-2 rounded">
                立即兑换
              </button>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500">暂无可用奖品。</li>
        )}
      </ul>
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

  const rewards = db.prepare("SELECT * FROM rewards").all();
  const user = db.prepare("SELECT points FROM users WHERE username = ?").get(username);
  
  return {
    props: {
      initialRewards: rewards,
      initialPoints: user ? user.points : 0
    }
  };
}