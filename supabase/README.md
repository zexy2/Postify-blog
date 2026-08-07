# Supabase kurulumu

Bu klasör Postify’ın Supabase şemasını, RLS politikalarını, seed içeriğini ve
read-only doğrulama sorgularını içerir. Fresh bir Supabase projesinde de
çalışacak şekilde iki migration katmanına ayrılmıştır.

Sıra:

1. Supabase Dashboard veya CLI ile projenin URL/DNS erişimini doğrula.
2. Fresh projede önce `migrations/202608070000_postify_base_schema.sql`, sonra
   `migrations/202608070001_postify_content_model.sql` dosyasını SQL Editor'da
   çalıştır.
3. `seed.sql` dosyasını çalıştır. Profile yoksa seed yazıları `Postify Editor`
   fallback yazarıyla yayınlar; ilk kayıt olan kullanıcı için profile trigger'ı
   otomatik çalışır.
4. `verify-readonly.sql` sorgularını çalıştır.
5. GitHub Actions repository variables içinde `VITE_SUPABASE_URL` ve
   `VITE_SUPABASE_ANON_KEY` değerlerini kontrol et.

Migration, public okuma ve authenticated yazma ayrımını RLS ile korur. Public
seed görselleri uygulamanın `public/images/posts` klasöründen servis edilir;
Supabase Storage bu ilk içerik akışı için gerekli değildir.
