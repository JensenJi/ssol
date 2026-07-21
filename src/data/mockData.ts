export interface Doctor {
  id: string;
  name: string;
  keywords: string[];
  category: string;
  hospital: string;
  title: string;
  location_lat: number;
  location_lng: number;
  province: string;
  city: string;
  verified: boolean;
  bio: string;
  contact_phone: string;
  visible_range: number;
  likes: number; // 获赞数
}

// 星级梯级系统（借鉴QQ/淘宝）
export function getStarLevel(likes: number): { level: number; title: string; icon: string } {
  if (likes >= 10000) return { level: 5, title: '传奇专家', icon: '👑' };
  if (likes >= 5000) return { level: 4, title: '资深专家', icon: '💎' };
  if (likes >= 1000) return { level: 3, title: '专业能手', icon: '🌟' };
  if (likes >= 100) return { level: 2, title: '行业新秀', icon: '⭐' };
  if (likes >= 10) return { level: 1, title: '入门达人', icon: '✨' };
  return { level: 0, title: '新手', icon: '🌱' };
}

export const mockDoctors: Doctor[] = [
  {
    id: '1', name: '张明远', keywords: ['渐冻症', '运动神经元病', '罕见神经疾病'],
    category: '疑难杂症', hospital: '北京协和医院', title: '主任医师',
    location_lat: 39.9087, location_lng: 116.3975, province: '北京', city: '北京',
    verified: true, bio: '专注渐冻症等罕见神经疾病20年，参与多项国际临床试验。',
    contact_phone: '138****1234', visible_range: 50, likes: 8520,
  },
  {
    id: '2', name: '李华', keywords: ['法洛四联症', '先天性心脏畸形', '大动脉转位'],
    category: '疑难杂症', hospital: '上海儿童医学中心', title: '副主任医师',
    location_lat: 31.2089, location_lng: 121.4765, province: '上海', city: '上海',
    verified: true, bio: '擅长复杂先天性心脏畸形矫治手术，尤其法洛四联症修复。',
    contact_phone: '139****5678', visible_range: 50, likes: 6230,
  },
  {
    id: '3', name: '王建国', keywords: ['陶瓷修复', '古瓷鉴损', '锔瓷'],
    category: '非遗手艺', hospital: '景德镇古窑修复中心', title: '高级修复师',
    location_lat: 29.2689, location_lng: 117.2149, province: '江西', city: '景德镇',
    verified: true, bio: '祖传三代锔瓷手艺，擅长破损古陶瓷无痕修复与鉴定。',
    contact_phone: '136****9012', visible_range: 200, likes: 3450,
  },
  {
    id: '4', name: '陈秀英', keywords: ['苗药浴', '瑶医火功', '民族医药'],
    category: '疑难杂症', hospital: '贵州民族医院', title: '主任医师',
    location_lat: 26.6470, location_lng: 106.6302, province: '贵州', city: '贵阳',
    verified: true, bio: '苗族医药传承人，擅长用苗药浴、瑶医火功治疗风湿顽疾。',
    contact_phone: '137****3456', visible_range: 100, likes: 2180,
  },
  {
    id: '5', name: '刘德明', keywords: ['陨石鉴定', '矿石分析', '地质勘探'],
    category: '稀有工种', hospital: '中科院地质研究所', title: '研究员',
    location_lat: 39.9842, location_lng: 116.3496, province: '北京', city: '北京',
    verified: true, bio: '地质学博士，30年陨石鉴定经验，已鉴定陨石标本2000余件。',
    contact_phone: '135****7890', visible_range: 500, likes: 1560,
  },
  {
    id: '6', name: '赵伟', keywords: ['果树嫁接', '柑橘黄龙病', '果树急救'],
    category: '农业专家', hospital: '华中农大果树研究所', title: '高级农艺师',
    location_lat: 30.4740, location_lng: 114.3660, province: '湖北', city: '武汉',
    verified: true, bio: '专注柑橘黄龙病防治与果树嫁接改良，挽救濒死果树上千棵。',
    contact_phone: '133****2345', visible_range: 300, likes: 890,
  },
  {
    id: '7', name: '孙丽娜', keywords: ['维语翻译', '古丝绸之路文献', '中亚语言'],
    category: '翻译语言', hospital: '新疆大学外国语学院', title: '副教授',
    location_lat: 43.7928, location_lng: 87.6177, province: '新疆', city: '乌鲁木齐',
    verified: true, bio: '精通维吾尔语、哈萨克语、塔吉克语，擅长古丝绸之路文献翻译。',
    contact_phone: '131****6789', visible_range: 99999, likes: 450,
  },
  {
    id: '8', name: '周强', keywords: ['冰川潜水', '洞穴探险救援', '深水打捞'],
    category: '特殊技能', hospital: '中国洞穴探险协会', title: '技术总监',
    location_lat: 25.0389, location_lng: 102.7183, province: '云南', city: '昆明',
    verified: true, bio: '专业洞穴潜水员，完成过多次洞穴救援和深水沉物打捞任务。',
    contact_phone: '130****0123', visible_range: 500, likes: 720,
  },
  {
    id: '9', name: '吴芳', keywords: ['古琴修复', '斫琴', '丝弦制作'],
    category: '非遗手艺', hospital: '扬州古琴工坊', title: '斫琴师',
    location_lat: 32.3932, location_lng: 119.4129, province: '江苏', city: '扬州',
    verified: true, bio: '非遗斫琴技艺传承人，修复过唐宋古琴30余张，自制丝弦。',
    contact_phone: '132****4567', visible_range: 200, likes: 1280,
  },
  {
    id: '10', name: '郑志明', keywords: ['冰川退缩研究', '冻土工程', '极地科考'],
    category: '稀有工种', hospital: '中科院寒旱所', title: '研究员',
    location_lat: 36.0611, location_lng: 103.8343, province: '甘肃', city: '兰州',
    verified: true, bio: '从事冰川与冻土研究25年，参加过南极、北极科考各两次。',
    contact_phone: '134****8901', visible_range: 500, likes: 960,
  },
  {
    id: '11', name: '黄海波', keywords: ['假肢矫形', '仿生义肢', '步态分析'],
    category: '稀有工种', hospital: '国家康复辅具研究中心', title: '高级工程师',
    location_lat: 39.8622, location_lng: 116.3531, province: '北京', city: '北京',
    verified: true, bio: '假肢矫形器设计制造专家，为上千截肢患者定制仿生义肢。',
    contact_phone: '138****2345', visible_range: 100, likes: 540,
  },
  {
    id: '12', name: '林晓燕', keywords: ['尼曼匹克病', '戈谢病', '溶酶体贮积症'],
    category: '疑难杂症', hospital: '浙江大学医学院附属儿童医院', title: '主任医师',
    location_lat: 30.2741, location_lng: 120.1551, province: '浙江', city: '杭州',
    verified: true, bio: '国内少数能诊治尼曼匹克病等超罕见遗传代谢病的专家。',
    contact_phone: '136****6789', visible_range: 500, likes: 3200,
  },
  {
    id: '13', name: '马俊杰', keywords: ['船舶堵漏', '水下焊接', '沉船打捞'],
    category: '特殊技能', hospital: '上海打捞局', title: '高级技师',
    location_lat: 31.2304, location_lng: 121.4737, province: '上海', city: '上海',
    verified: true, bio: '30年水下作业经验，完成过百余次沉船打捞和船舶应急堵漏。',
    contact_phone: '139****4321', visible_range: 300, likes: 1850,
  },
  {
    id: '14', name: '杨秀珍', keywords: ['壮锦织造', '侗族大歌', '非遗手工艺'],
    category: '非遗手艺', hospital: '广西非遗保护中心', title: '传承人',
    location_lat: 22.8170, location_lng: 108.3665, province: '广西', city: '南宁',
    verified: true, bio: '壮锦织造国家级非遗传承人，同时精通侗族大歌演唱与教学。',
    contact_phone: '137****8765', visible_range: 200, likes: 2640,
  },
  {
    id: '15', name: '何志远', keywords: ['高压线带电作业', '特高压检修', '电力抢险'],
    category: '稀有工种', hospital: '国家电网超高压公司', title: '特级技师',
    location_lat: 30.5728, location_lng: 114.3162, province: '湖北', city: '武汉',
    verified: true, bio: '特高压带电作业专家，能在1000千伏线路上进行等电位检修。',
    contact_phone: '135****6543', visible_range: 500, likes: 1120,
  },
  {
    id: '16', name: '苏小梅', keywords: ['香篆制作', '古法制香', '沉香鉴伪'],
    category: '非遗手艺', hospital: '海南沉香文化园', title: '制香师',
    location_lat: 19.1959, location_lng: 109.7462, province: '海南', city: '海口',
    verified: false, bio: '祖传制香第四代，擅长古法沉香的炮制与真伪鉴别。',
    contact_phone: '133****1098', visible_range: 100, likes: 320,
  },
  {
    id: '17', name: '陈大锤', keywords: ['铁匠', '手工锻刀', '大马士革钢'],
    category: '非遗手艺', hospital: '龙泉宝剑锻制坊', title: '锻冶师',
    location_lat: 28.0710, location_lng: 119.2890, province: '浙江', city: '龙泉',
    verified: true, bio: '龙泉宝剑非遗传承人，精通大马士革钢折叠锻焊工艺。',
    contact_phone: '131****7654', visible_range: 200, likes: 4580,
  },
  {
    id: '18', name: '阿依古丽', keywords: ['地毯修复', '羊毛染色', '维吾尔花纹'],
    category: '非遗手艺', hospital: '和田地毯工坊', title: '织毯师',
    location_lat: 37.1107, location_lng: 79.9269, province: '新疆', city: '和田',
    verified: false, bio: '维吾尔族传统地毯编织手艺人，擅长古地毯修复和天然染色。',
    contact_phone: '130****3456', visible_range: 300, likes: 180,
  },
];

export const departments = ['全部分类', '疑难杂症', '稀有工种', '非遗手艺', '农业专家', '特殊技能', '翻译语言'];

export const distanceOptions = [
  { label: '5公里内', value: 5 },
  { label: '10公里内', value: 10 },
  { label: '50公里内', value: 50 },
  { label: '100公里内', value: 100 },
  { label: '500公里内', value: 500 },
  { label: '全国', value: 99999 },
];

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
