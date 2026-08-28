# Supabase kurulumu

Bu klasör Postify’ın Supabase şemasını, RLS politikalarını, seed içeriğini ve
read-only doğrulama sorgularını içerir. Fresh bir Supabase projesinde de
çalışacak şekilde sıralı ve production-history ile hizalı migration zinciri kullanır.

Sıra:

1. Supabase Dashboard veya CLI ile projenin URL/DNS erişimini doğrula.
2. Fresh projede `migrations/*.sql` dosyalarını dosya adı sırasıyla uygula. Bu sıra production Supabase migration history ile aynıdır.
3. `seed.sql` dosyasını çalıştır. Profile yoksa seed yazıları `Postify Editor`
   fallback yazarıyla yayınlar; ilk kayıt olan kullanıcı için profile trigger'ı
   otomatik çalışır.
4. `verify-readonly.sql` sorgularını çalıştır.
5. GitHub Actions repository secrets içinde `VITE_SUPABASE_URL` ve
   `VITE_SUPABASE_ANON_KEY` değerlerini kontrol et.

Migration, public okuma ve authenticated yazma ayrımını RLS ile korur.
Seed görselleri uygulamanın `public/images/posts` klasöründen servis edilir;
Storage bucket'ları ise yeni yazı görselleri ve avatar yüklemeleri için hazırdır.
