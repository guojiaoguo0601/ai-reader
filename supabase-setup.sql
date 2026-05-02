-- 创建书籍表
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT DEFAULT '未知作者',
  chapters JSONB NOT NULL DEFAULT '[]',
  current_chapter INTEGER DEFAULT 0,
  current_scroll INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用行级安全
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能看到自己的书
CREATE POLICY "Users can only see their own books"
  ON public.books
  FOR ALL
  USING (auth.uid() = user_id);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_updated_at ON public.books;
CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 头像存储桶（用于个人资料头像上传）
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 允许认证用户上传头像
CREATE POLICY "Allow authenticated avatar uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- 允许所有人查看头像
CREATE POLICY "Allow public avatar viewing"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- 允许用户删除自己的头像
CREATE POLICY "Allow users to delete own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());
