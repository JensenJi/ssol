# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/rules) for the full list of rules and categories.

---

## Supabase 数据库初始化（访问统计用）

管理后台「访问流量分析」需要 `public.visits` 表。**数据写入 Supabase，不是 localStorage**（session_id 用于同会话去重才用 localStorage）。

### 一键建表 SQL

请在 Supabase 控制台 **SQL Editor** 中执行（项目 ID: `cmfsfvuzgyktfxjvjmvj`）：

入口：https://supabase.com/dashboard/project/cmfsfvuzgyktfxjvjmvj/sql/new

```sql
-- 访问日志表
create table if not exists public.visits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  session_id text not null,
  url text,
  referrer text,
  referrer_host text,
  referrer_type text,
  referrer_keyword text,
  os text,
  device_type text,
  browser text,
  browser_engine text,
  country text,
  region text,
  city text,
  user_agent text
);

-- 索引
create index if not exists visits_created_at_idx on public.visits (created_at desc);
create index if not exists visits_session_idx on public.visits (session_id);

-- RLS：允许任何人插入/读取统计（写入是匿名前端，读取是管理后台）
alter table public.visits enable row level security;

drop policy if exists "anyone can insert visits" on public.visits;
create policy "anyone can insert visits" on public.visits
  for insert with check (true);

drop policy if exists "anyone can read visits" on public.visits;
create policy "anyone can read visits" on public.visits
  for select using (true);
```

执行完后，访问你的站点任意页面，再回到管理后台「访问流量分析」即可看到数据。
