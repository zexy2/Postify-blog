# Supabase kurulumu

Bu klasör Postify’ın Supabase şemasını, RLS politikalarını, seed içeriğini ve
read-only doğrulama sorgularını içerir. Fresh bir Supabase projesinde de
çalışacak şekilde iki migration katmanına ayrılmıştır.

Sıra:

1. Supabase Dashboard veya CLI ile projenin URL/DNS erişimini doğrula.
2. Fresh projede sırasıyla `migrations/202608070000_postify_base_schema.sql`,
   `migrations/202608070001_postify_content_model.sql` ve
   `migrations/202608070002_postify_security_and_storage.sql` dosyalarını SQL
   Editor'da çalıştır.
3. `seed.sql` dosyasını çalıştır. Profile yoksa seed yazıları `Postify Editor`
   fallback yazarıyla yayınlar; ilk kayıt olan kullanıcı için profile trigger'ı
   otomatik çalışır.
4. `verify-readonly.sql` sorgularını çalıştır.
5. GitHub Actions repository variables içinde `VITE_SUPABASE_URL` ve
   `VITE_SUPABASE_ANON_KEY` değerlerini kontrol et.

Migration, public okuma ve authenticated yazma ayrımını RLS ile korur.
Seed görselleri uygulamanın `public/images/posts` klasöründen servis edilir;
Storage bucket'ları ise yeni yazı görselleri ve avatar yüklemeleri için hazırdır.
