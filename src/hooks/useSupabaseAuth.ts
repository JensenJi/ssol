import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name,
        });
      }
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  // 邮箱注册
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!configured) return { error: { message: 'Supabase 未配置' } };
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || '' },
      },
    });
    
    if (error) return { error };
    if (data.user && !data.session) {
      return { error: { message: '注册成功！请检查邮箱完成验证后再登录。' } };
    }
    return { error: null };
  }, [configured]);

  // 邮箱登录
  const signIn = useCallback(async (email: string, password: string) => {
    if (!configured) return { error: { message: 'Supabase 未配置' } };
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, [configured]);

  // 退出
  const signOut = useCallback(async () => {
    if (!configured) return;
    await supabase.auth.signOut();
    setUser(null);
  }, [configured]);

  // 重置密码
  const resetPassword = useCallback(async (email: string) => {
    if (!configured) return { error: { message: 'Supabase 未配置' } };
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }, [configured]);

  return {
    user,
    loading,
    configured,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
