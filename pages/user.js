// pages/user.js
import { useState } from 'react'; // 引入 useState
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuth from '../hooks/useAuth';


export default function UserPage({ user: initialUser, userSignups }) {
  const router = useRouter();
  const { isAdmin, logout, user } = useAuth(); // 使用 useAuth 获取当前用户

  // 个人资料编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [realName, setRealName] = useState(initialUser.real_name || '');
  const [email, setEmail] = useState(initialUser.email || '');
  const [phone, setPhone] = useState(initialUser.phone || '');
  const [message, setMessage] = useState(''); // 用于显示更新消息

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

  // 处理资料更新
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(''); // 清空之前的消息

    try {
      const res = await fetch('/api/update-profile', {
        method: 'PUT', // 使用 PUT 请求更新资料
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: initialUser.username, // 传递当前用户的用户名
          real_name: realName,
          email: email,
          phone: phone,
        }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setIsEditing(false); // 更新成功后退出编辑模式
        // 如果useAuth的user状态是基于cookie，可能需要刷新页面或重新获取cookie
        // 或者简单地在前端更新useAuth的user状态，但这里我们依赖下次加载
        // 为了确保数据实时性，可能需要在这里刷新页面或者重新获取user数据
        router.replace(router.asPath); // 刷新当前页面以获取最新的用户数据
      }
    } catch (error) {
      setMessage('更新资料时发生错误。');
      console.error('更新资料失败:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">用户中心</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">个人信息</h2>
        {message && (
          <p className={`mb-4 text-center text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        
        {isEditing ? (
          // 编辑模式
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">真实姓名:</label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">电子邮箱:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">电话号码:</label>
              <input
                type="tel" // 使用tel类型可以方便移动端输入
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <p className="text-gray-700 mb-4"><strong>用户名:</strong> {initialUser.username} (不可修改)</p>
            <p className="text-gray-700 mb-4"><strong>志愿时长:</strong> {initialUser.volunteer_hours} 小时</p>
            <p className="text-gray-700 mb-4"><strong>可用积分:</strong> {initialUser.points} 积分</p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                取消
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                保存修改
              </button>
            </div>
          </form>
        ) : (
          // 查看模式
          <>
            <p className="text-gray-700"><strong>用户名:</strong> {initialUser.username}</p>
            <p className="text-gray-700"><strong>真实姓名:</strong> {initialUser.real_name || '未填写'}</p>
            <p className="text-gray-700"><strong>电子邮箱:</strong> {initialUser.email || '未填写'}</p>
            <p className="text-gray-700"><strong>电话号码:</strong> {initialUser.phone || '未填写'}</p>
            <p className="text-gray-700"><strong>志愿时长:</strong> {initialUser.volunteer_hours} 小时</p>
            <p className="text-gray-700"><strong>可用积分:</strong> {initialUser.points} 积分</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                修改资料
              </button>
            </div>
          </>
        )}
        
        {/* 新增：用户功能按钮区域 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/rewards" className="block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors">
            积分商城
          </Link>
          <Link href="/my-redeems" className="block bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors">
            我的兑换记录
          </Link>
        </div>
      </div>

      {/* 我的活动报名区域 - 保持不变 */}
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

      {/* 管理员专属区域 - 保持不变 */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">管理员工具</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/manage-signups" className="bg-indigo-500 text-white text-center px-4 py-2 rounded hover:bg-indigo-600 transition-colors">
              审核报名
            </Link>
            <Link href="/add-activity" className="bg-green-500 text-white text-center px-4 py-2 rounded hover:bg-green-600 transition-colors">
              添加新活动
            </Link>
            <Link href="/admin/my-activities" className="bg-red-500 text-white text-center px-4 py-2 rounded hover:bg-red-600 transition-colors">
              我发布的活动
            </Link>
            <Link href="/admin/rewards" className="bg-orange-500 text-white text-center px-4 py-2 rounded hover:bg-orange-600 transition-colors">
              修改积分商城
            </Link>
            <Link href="/admin/all-redeems" className="block bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors">
              所有兑换记录
            </Link>
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
          onClick={userLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}

// getServerSideProps 保持不变，因为用户数据仍由服务器获取
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
      user: JSON.parse(JSON.stringify(user)), // 确保数据可序列化
      userSignups: JSON.parse(JSON.stringify(userSignups)), // 确保数据可序列化
    },
  };
}