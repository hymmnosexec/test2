// pages/user.js
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function UserPage({ user, userSignups }) {
  const router = useRouter();
  const { isAdmin, logout } = useAuth();

  const userLogout = async () => {
    await logout();
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '已报名':
        return 'text-blue-500';
      case '审核通过':
        return 'text-green-500';
      case '审核拒绝':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">用户中心</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">个人信息</h2>
        <p className="text-gray-700"><strong>用户名:</strong> {user.username}</p>
        <p className="text-gray-700"><strong>真实姓名:</strong> {user.real_name || '未填写'}</p>
        <p className="text-gray-700"><strong>电子邮箱:</strong> {user.email || '未填写'}</p>
        <p className="text-gray-700"><strong>电话号码:</strong> {user.phone || '未填写'}</p>
        <p className="text-gray-700"><strong>志愿时长:</strong> {user.volunteer_hours} 小时</p>
        <p className="text-gray-700"><strong>可用积分:</strong> {user.points} 积分</p>
      </div>

      {/* 新增：我的活动报名区域 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">我的活动报名</h2>
        {userSignups && userSignups.length > 0 ? (
          <ul className="space-y-4">
            {userSignups.map(signup => (
              <li key={signup.activity_id} className="p-4 border rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{signup.title}</h3>
                  <span className={`font-bold ${getStatusColor(signup.status)}`}>
                    {signup.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">你还没有报名任何活动。</p>
        )}
      </div>

      {/* 管理员专属区域 */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">管理员工具</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/admin/review-signups" className="bg-purple-500 text-white text-center px-4 py-2 rounded hover:bg-purple-600 transition-colors">
              审核报名
            </a>
            <a href="/admin/my-activities" className="bg-green-500 text-white text-center px-4 py-2 rounded hover:bg-green-600 transition-colors">
              我发布的活动
            </a>
            <a href="/add-activity" className="bg-green-500 text-white text-center px-4 py-2 rounded hover:bg-green-600 transition-colors">
              添加新活动
            </a>
            <a href="/admin/rewards" className="bg-yellow-500 text-white text-center px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
              修改积分商城
            </a>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          返回主页
        </button>
        <button
          onClick={() => router.push('/rewards')}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
        >
          积分商城
        </button>
        <button
          onClick={userLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          退出登录
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
  const user = db.prepare(
    `SELECT username, real_name, email, phone, volunteer_hours, points FROM users WHERE username = ?`
  ).get(username);
  
  const userSignups = db.prepare(
    `SELECT s.status, a.title, a.id AS activity_id FROM signups AS s JOIN activities AS a ON s.activity_id = a.id WHERE s.username = ?`
  ).all(username);

  return {
    props: {
      user,
      userSignups,
    },
  };
}