import { createClient } from '@supabase/supabase-js';

// Supabase 配置 - 请替换为你自己的项目 URL 和 anon key
// 在 https://supabase.com 创建免费项目后，在 Settings > API 中找到
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cmfsfvuzgyktfxjvjmvj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QoCGDOy4IcDyEvz2rVaP5w_7uHsL1yE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 检查是否已配置
export const isSupabaseConfigured = () => {
  return !supabaseUrl.includes('YOUR_PROJECT') && !supabaseAnonKey.includes('YOUR_');
};
