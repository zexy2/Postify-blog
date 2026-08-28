# Postify

**Okumak için değil, uygulamak için.**

Postify; geliştiriciler ve ürün üretenler için uygulanabilir bilgiyi öne çıkaran bir yayınlama deneyimidir. Genel amaçlı bir blog klonu olmak yerine içeriği dört kullanışlı formata ayırır:

- **Rehber** — somut bir işi tamamlatır.
- **Karar notu** — seçenekleri ve ödünleşimleri görünür kılar.
- **Açıklayıcı** — bir kavram için hızlı, doğru zihinsel model kurar.
- **Saha notu** — gerçek bir deneyimden sonucu ve dersi kaydeder.

## Şu anki ürün yönü

Okur tarafında içerik türü, beklenen sonuç, okuma süresi ve güncellik sinyalleri öne çıkarılır. Yazar tarafında içerik biçimi seçimi ve yapılandırılmış yazım rehberi vardır; yerel taslaklar otomatik saklanır. Mevcut Supabase modeli korunur ve yeni ürün modeli doğrulanana kadar migration yapılmaz.

## Stack

React 19, Vite 7, React Router, Redux Toolkit, TanStack Query, TipTap, Supabase client, Vitest, Playwright ve PWA/Workbox.

## Local development

```bash
npm ci
npm run dev
```

## Quality gate

```bash
npm run verify
```

`verify`; unit/component testlerini, ESLint'i, production build'i ve kritik build artifact smoke kontrolünü tek komutta çalıştırır.

Tek tek komutlar:

```bash
npm test
npm run lint
npm run build
npm run smoke:build
npm run preview
```

## Environment

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Supabase production schema değişiklikleri ürün modeli doğrulanana kadar bilinçli olarak ertelenmiştir.

## License

MIT
