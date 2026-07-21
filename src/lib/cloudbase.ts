import cloudbase from '@cloudbase/js-sdk';

// 腾讯云开发配置
// 请在腾讯云控制台创建环境后替换以下配置
// 控制台地址：https://console.cloud.tencent.com/tcb
const config = {
  env: 'ssol-mini-program-d1dhwxbb882684', // 腾讯云开发环境 ID
};

// 初始化云开发
const app = cloudbase.init(config);

// 获取数据库引用
export const db = app.database();

// 获取认证引用
export const auth = app.auth({
  persistence: 'local',
});

// 云函数调用封装
export const callFunction = async (name: string, data: any = {}) => {
  try {
    const result = await app.callFunction({ name, data });
    return result.result;
  } catch (error) {
    console.error(`云函数 ${name} 调用失败:`, error);
    throw error;
  }
};

// 数据库操作封装
export const collection = (name: string) => db.collection(name);

// 用户相关操作
export const userAPI = {
  // 注册
  register: async (userData: any) => {
    return await collection('users').add(userData);
  },
  // 获取待审核用户
  getPendingUsers: async () => {
    const res = await collection('users').where({ verified: false }).get();
    return res.data;
  },
  // 审核通过
  approveUser: async (id: string) => {
    return await collection('users').doc(id).update({ verified: true });
  },
  // 拒绝申请
  rejectUser: async (id: string) => {
    return await collection('users').doc(id).remove();
  },
  // 获取所有认证专家
  getVerifiedExperts: async () => {
    const res = await collection('users').where({ verified: true }).get();
    return res.data;
  },
};

// 访客统计操作
export const visitorAPI = {
  // 记录访客
  recordVisit: async (data: any) => {
    return await collection('visitors').add({
      ...data,
      timestamp: new Date(),
    });
  },
  // 获取今日访客数
  getTodayVisits: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const res = await collection('visitors')
      .where({ timestamp: db.command.gte(today.getTime()) })
      .count();
    return res.total;
  },
};

export default app;
