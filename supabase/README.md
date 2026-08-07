# Supabase kurulumu

Bu klasör mevcut Supabase projesi için migration, seed ve read-only doğrulama
sorgularını içerir. Yeni Supabase projesi oluşturmaz.

Sıra:

1. Supabase Dashboard veya CLI ile mevcut projenin URL/DNS erişimini doğrula.
2. `migrations/202608070001_postify_content_model.sql` dosyasını SQL Editor'da çalıştır.
3. En az bir editor profili oluşturup `seed.sql` dosyasını çalıştır.
4. `verify-readonly.sql` sorgularını çalıştır.
5. GitHub Actions repository variables içinde `VITE_SUPABASE_URL` ve
   `VITE_SUPABASE_ANON_KEY` değerlerini kontrol et.

Seed ilk mevcut `profiles` kaydını editor olarak kullanır. Migration, mevcut
`posts` tablosuna UUID `author_id` bekler; bu nedenle canlı tablo şeması
doğrulanmadan çalıştırılmamalıdır.
