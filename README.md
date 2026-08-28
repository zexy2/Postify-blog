# Postify

**Okumak için değil, uygulamak için — ve neye dayanarak güveneceğini görmek için.**

Postify, geliştiriciler ve ürün üretenler için **Verified Knowledge** odaklı bir bilgi ağıdır. Genel amaçlı bir blog klonu olmak yerine içeriği uygulanabilirlik, kanıt, güncellik ve yeniden üretilebilirlik sinyalleriyle sunar.

## İçerik biçimleri

- **Rehber** — somut bir işi tamamlatır.
- **Karar notu** — seçenekleri ve ödünleşimleri görünür kılar.
- **Açıklayıcı** — bir kavram için hızlı, doğru zihinsel model kurar.
- **Saha notu** — gerçek bir deneyimden sonucu ve dersi kaydeder.

## Güven modeli

Postify üç farklı durumu özellikle birbirine karıştırmaz:

- **Doğrulanmamış / Unverified** — yazar test iddiasında bulunmaz.
- **Yazar test etti / Author tested** — geçerli test tarihi, anlamlı ortam/sürüm bilgisi ve doğrulama adımları vardır. Bu, yazar beyanıdır; bağımsız Postify çalıştırması değildir.
- **Postify verified** — yazar tarafından seçilemez. Yalnız checked-in deterministik kodun release sırasında gerçekten çalıştırılması, gösterilen kodla artifactın birebir eşleşmesi ve takip edilen runtime güncelliğinin hâlâ `current` olmasıyla türetilir.

Topluluk `Çalıştı / Çalışmadı` kanıtı authenticated kullanıcılar için Supabase'e kalıcı yazılır; bir kullanıcı bir postun sayacını tekrar tekrar şişiremez. Public yüzeyler ham kullanıcı kimliği/notu yerine privacy-safe aggregate gösterir. Girişsiz geri bildirim cihazda kalır.

## Production

- Site: `https://postify.zekiakgul.dev/`
- Backend: Supabase/PostgreSQL + RLS
- Production Verified Knowledge migrations aktiftir.
- Machine-readable trust artifactları: `/verification-runs.json`, `/runtime-release-status.json`, `/knowledge/<slug>.<locale>.json`
- Otomatik Node doğrulaması Node 24 LTS hattını takip eder. Yeni LTS çıktığında veya freshness sinyali güvenilir değilse mevcut historical execution korunur ama güncel `Postify verified` rozeti geri çekilir.

## Stack

React 19, Vite 7, React Router 7, Redux Toolkit, TanStack Query, TipTap, Supabase/PostgreSQL, Vitest, Playwright, PWA/Workbox ve GitHub Actions.

Hosted verify/build/deploy runtime'ı Node **24.20.0**'dır. Playwright package/container parity ve npm audit release gate tarafından fail-closed kontrol edilir.

## Local development

```bash
npm ci
npm run dev
```

Gerekli environment değişkenleri:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key
```

Secret/service-role değerlerini browser bundle'a koymayın.

## Quality gates

Deterministik uygulama doğrulaması:

```bash
npm run verify
```

Hosted/release supply-chain kontrolü:

```bash
npm run verify:security
```

Browser ürün testi:

```bash
npm run test:e2e:ui
```

DB migration değişiklikleri ayrıca fresh PostgreSQL 16 üzerinde tüm migration zinciri ve `supabase/verify-verified-knowledge.sql` ile doğrulanır. Production migration history repair edilmez; yeni migration'lar additive uygulanır ve remote ledger sürümü repository ile birebir hizalanır.

## Önemli sınırlar

- Otomatik verifier arbitrary/untrusted kod sandbox'ı değildir; checked-in deterministik Node snippet'leriyle sınırlıdır.
- `Postify verified` hiçbir zaman author-writable DB metadata değildir.
- Kanıt/topluluk sayıları veya authenticated browser coverage uydurulmaz.
- GitHub Pages deep-link ilk HTTP 404 davranışı hosting sınırıdır; browser fallback ve production Chromium smoke bunu ayrı doğrular.

## License

MIT
