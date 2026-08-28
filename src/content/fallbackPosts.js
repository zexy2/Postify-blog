export const FALLBACK_AUTHOR = {
  id: 'fallback-editor',
  name: 'Postify Editör',
  fullName: 'Postify Editör',
  username: 'postify',
  email: '',
  avatarUrl: null,
  avatar_url: null,
  bio: 'Postify için teknoloji, ürün ve geliştirme üzerine editoryal notlar.',
  role: 'editor',
};

const FALLBACK_CATALOG = [
  {
    id: 'fallback-ai-muhendisligi',
    slug: 'ai-muhendisligi',
    category: 'Yapay zekâ',
    coverImageUrl: '/images/posts/ai-muhendisligi.webp',
    readingTime: 6,
    publishedAt: '2026-08-07T00:00:00.000Z',
    outcome: 'AI özelliğini model çağrısı yerine ölçülebilir ve güvenli bir ürün sistemi olarak tasarlamak.',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 120,
      environment: ['Postify ürün incelemesi', 'React 19', 'Vite 7'],
      prerequisites: ['Bir AI özelliği için ölçülebilir kullanıcı sonucunu tanımlamış olmak'],
      verificationSteps: ['Başarı metriğini model seçmeden önce yaz', 'Hatalı çıktı için geri alma veya insan onayı yolu tanımla', 'Model değişse bile ürün sözleşmesinin aynı kaldığını kontrol et'],
      caveats: ['Bu içerik bir model benchmarkı veya sağlayıcı karşılaştırması değildir.'],
      sources: [],
    },
    translations: {
      tr: {
        title: 'AI özelliği değil, iyi tasarlanmış bir sistemdir',
        excerpt: 'Bir ürüne yapay zekâ eklemekten önce veri, geri bildirim ve hata sınırlarını tasarlamak gerekir.',
        body: `Yapay zekâ özellikleri çoğu üründe tek bir model çağrısından ibaretmiş gibi anlatılıyor. Gerçekte kullanıcıya güvenilir bir deneyim vermek; doğru girdiyi toplamak, çıktıyı değerlendirmek ve hatalı sonucu güvenle ele almakla mümkün.

İlk karar model seçimi değil, özelliğin hangi kararı hızlandıracağı olmalı. Kullanıcı bir öneriyi neden gördüğünü anlayamıyorsa, en iyi model bile güven üretmez. Bu nedenle açıklanabilirlik, geri alma ve insan onayı akışları ürünün temel parçalarıdır.

İyi bir AI özelliği; ölçülebilir fayda, kontrollü hata ve açık bir sınırla başlar. Model değişebilir, fakat bu ürün sözleşmesi değişmemelidir.`,
      },
      en: {
        title: 'An AI feature is a system, not a model call',
        excerpt: 'Before adding AI to a product, design the data, feedback loops, and failure boundaries around it.',
        body: `AI features are often described as if they were a single model call. A reliable user experience also needs good inputs, output evaluation, and a safe way to handle mistakes.

The first decision should not be which model to use. It should be which user decision the feature will improve. If people cannot understand why a suggestion appeared, even a strong model will struggle to earn trust.

Good AI product work starts with measurable value, controlled failure, and a clear boundary. The model can change; that product contract should not.`,
      },
    },
  },
  {
    id: 'fallback-web-standartlari',
    slug: 'web-standartlari',
    category: 'Web geliştirme',
    coverImageUrl: '/images/posts/web-standartlari.webp',
    readingTime: 5,
    publishedAt: '2026-08-06T00:00:00.000Z',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 180,
      environment: ['Web standartları kontrol listesi'],
      prerequisites: ['Semantik HTML', 'Klavye erişimi', 'Görünür focus'],
      verificationSteps: ['Kritik akışı yalnızca klavyeyle tamamla', 'Başlık hiyerarşisini ve form etiketlerini kontrol et'],
      caveats: [],
      sources: [],
    },
    translations: {
      tr: {
        title: 'Web standartları hızdan önce gelir',
        excerpt: 'Erişilebilir HTML ve sağlam tarayıcı davranışı, performans optimizasyonlarının en ucuz temelidir.',
        body: `Modern bir arayüzü hızlı yapmak yalnızca bundle boyutunu küçültmek değildir. Sayfanın tarayıcı tarafından doğru anlaşılması, klavye ile kullanılabilmesi ve ağ koşulları kötüleştiğinde anlamını koruması gerekir.

Semantik HTML, form etiketleri, görünür odak durumu ve doğru başlık hiyerarşisi çoğu projede sonradan eklenmeye çalışılıyor. Oysa bunlar bileşenin API'si kadar erken tasarlanmalı.

Standartlara uyan bir arayüz daha az sürpriz üretir. Bu da hem performans hem test hem de uzun vadeli bakım maliyetinde doğrudan karşılık bulur.`,
      },
      en: {
        title: 'Web standards come before speed',
        excerpt: 'Accessible HTML and predictable browser behavior are the cheapest foundation for performance.',
        body: `Making a modern interface fast is not only about shrinking the bundle. The browser should understand the page, keyboard users should be able to operate it, and the interface should retain its meaning on a poor connection.

Semantic HTML, form labels, visible focus, and a clear heading hierarchy are often treated as cleanup work. They should be designed as early as the component API.

Standards reduce surprises. That pays off in performance, testing, and the cost of maintaining the product over time.`,
      },
    },
  },
  {
    id: 'fallback-frontend-performansi',
    slug: 'frontend-performansi',
    category: 'Frontend',
    coverImageUrl: '/images/posts/frontend-performansi.webp',
    readingTime: 7,
    publishedAt: '2026-08-05T00:00:00.000Z',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 180,
      environment: ['Frontend performans incelemesi'],
      prerequisites: ['Mobil viewport', 'Gerçek kullanıcı akışı'],
      verificationSteps: ['İlk ekranı ve temel etkileşimi ölç', 'Layout shift ve gereksiz JavaScript yükünü kontrol et'],
      caveats: [],
      sources: [],
    },
    translations: {
      tr: {
        title: 'Frontend performansı ölçüm değil, kullanıcı akışıdır',
        excerpt: 'Lighthouse puanı tek başına yetmez; gerçek darboğazı ilk anlamlı etkileşimde ve mobil ağda arayın.',
        body: `Performans çalışmaları çoğu zaman tek bir skorun peşinden gidiyor. Skorlar yararlı bir sinyal olsa da kullanıcı için asıl soru sayfanın ne zaman anlaşılır ve etkileşilebilir hale geldiğidir.

Önce kritik akışı tanımlayın: ilk ekran, arama, yazı açma ve geri dönme. Bu akışta gereksiz JavaScript'i ertelemek, görselleri doğru boyutta sunmak ve layout kaymasını önlemek genellikle gösterişli optimizasyonlardan daha fazla fark yaratır.

Ölçümü gerçek cihaz, gerçek ağ ve tekrar eden kullanıcı akışıyla yapın. İyi performans, raporda güzel görünen değil, kullanıcıyı bekletmeyen deneyimdir.`,
      },
      en: {
        title: 'Frontend performance is a user flow, not a score',
        excerpt: 'Lighthouse is a useful signal, but the real bottleneck appears in the first meaningful interaction on mobile.',
        body: `Performance work often chases a single score. Scores are useful signals, but users care about when the page becomes understandable and interactive.

Start with the critical flow: first paint, search, opening a story, and returning to the list. Deferring nonessential JavaScript, serving correctly sized images, and preventing layout shifts usually matter more than flashy optimizations.

Measure on a real device, a real network, and a repeatable user flow. Good performance is the experience that does not make people wait.`,
      },
    },
  },
  {
    id: 'fallback-urun-tasarimi',
    slug: 'urun-tasarimi',
    category: 'Ürün tasarımı',
    coverImageUrl: '/images/posts/urun-tasarimi.webp',
    readingTime: 5,
    publishedAt: '2026-08-04T00:00:00.000Z',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 180,
      environment: ['Ürün karar incelemesi'],
      prerequisites: ['Karar sırası', 'Geri alınabilir aksiyonlar'],
      verificationSteps: ['Ekrandaki birincil kararı belirle', 'Gereksiz eşzamanlı seçenekleri kaldır'],
      caveats: [],
      sources: [],
    },
    translations: {
      tr: {
        title: 'İyi ürün tasarımı seçenekleri azaltır',
        excerpt: 'Kullanıcıya her ihtimali göstermek yerine doğru varsayılanı ve geri dönüş yolunu tasarlayın.',
        body: `Karmaşık ürünler çoğu zaman çok özellikli oldukları için değil, her kararı kullanıcıya bıraktıkları için yorucudur. İyi tasarım, önemli seçimi görünür kılar ve geri dönüşü kolay tutar.

Bir ekranı sadeleştirmenin ilk adımı butonları küçültmek değil, karar sırasını anlamaktır. Kullanıcı neyi önce yapmalı? Hangi bilgi o anda gerekli? Hangi hata geri alınabilir?

Doğru varsayılanlar kullanıcıyı kısıtlamaz; dikkatini işin özüne taşır. Tasarımın görevi bütün ihtimalleri sergilemek değil, doğru sonraki adımı anlaşılır kılmaktır.`,
      },
      en: {
        title: 'Good product design reduces choices',
        excerpt: 'Instead of exposing every possibility, design the right default and an easy way back.',
        body: `Complex products are tiring not only because they have many features, but because they leave every decision to the user. Good design makes the important choice visible and keeps recovery easy.

The first step in simplifying a screen is not shrinking buttons. It is understanding the decision order: what should happen first, what information is needed now, and which mistakes can be undone?

Good defaults do not restrict people. They move attention to the work that matters.`,
      },
    },
  },
  {
    id: 'fallback-edge-mimarileri',
    slug: 'edge-mimarileri',
    category: 'Mimari',
    coverImageUrl: '/images/posts/edge-mimarileri.webp',
    readingTime: 6,
    publishedAt: '2026-08-03T00:00:00.000Z',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 180,
      environment: ['Mimari karar incelemesi'],
      prerequisites: ['Veri sahipliği', 'Tutarlılık ihtiyacı'],
      verificationSteps: ['Kaynak sistemi tanımla', 'Edge eklemeden önce gerçek gecikme darboğazını doğrula'],
      caveats: [],
      sources: [],
    },
    translations: {
      tr: {
        title: 'Edge mimarisi her problemi çözmez',
        excerpt: 'Gecikmeyi azaltmadan önce veri sahipliğini, tutarlılık ihtiyacını ve operasyon maliyetini netleştirin.',
        body: `Edge yaklaşımı kullanıcıya yakın çalışarak gecikmeyi azaltabilir. Ancak her veriyi kenara taşımak, sistemin tutarlılık ve gözlemlenebilirlik sorunlarını ortadan kaldırmaz.

İyi bir karar için üç soruya bakın: Bu işlem ne kadar sık çalışıyor? Güncel veri şart mı? Hata olduğunda hangi sistem kaynak gerçek olacak? Bu sorular cevaplanmadan dağıtık cache veya edge function eklemek yalnızca daha fazla hareketli parça yaratır.

Edge, belirli bir darboğaza verilmiş bir mimari cevaptır; varsayılan teknoloji seçimi değildir.`,
      },
      en: {
        title: 'Edge architecture does not solve every problem',
        excerpt: 'Before reducing latency, clarify data ownership, consistency needs, and the operational cost.',
        body: `Edge systems can reduce latency by running closer to users. Moving every piece of data to the edge does not remove consistency or observability problems.

Ask three questions: how often does this operation run, does it require fresh data, and which system is the source of truth when something fails? Without those answers, adding caches or edge functions only creates more moving parts.

Edge is an architectural response to a specific bottleneck, not a default technology choice.`,
      },
    },
  },
  {
    id: 'fallback-gelistirici-akisi',
    slug: 'gelistirici-akisi',
    category: 'Geliştirici araçları',
    coverImageUrl: '/images/posts/gelistirici-akisi.webp',
    readingTime: 4,
    publishedAt: '2026-08-02T00:00:00.000Z',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 180,
      environment: ['Postify CI/CD akışı'],
      prerequisites: ['GitHub Actions', 'Build smoke'],
      verificationSteps: ['Test, lint ve build kapılarını çalıştır', 'Deploy edilen commit ile production çıktısını eşleştir'],
      caveats: [],
      sources: [],
    },
    translations: {
      tr: {
        title: 'Geliştirici akışında güven, otomasyondan önce gelir',
        excerpt: 'CI/CD yalnızca hızlı deploy etmek değil, neyin deploy edildiğini kanıtlayabilmektir.',
        body: `İyi bir geliştirici akışı geliştiriciyi daha hızlı komut yazmaya değil, daha az belirsizlikle karar vermeye yardımcı olur. Bunun için küçük ama güvenilir kontroller gerekir.

Lint, test ve build adımları tek başına yeterli değildir. Üretim ortamının hangi commit'ten çıktığı, gerekli değişkenlerin mevcut olup olmadığı ve kritik akışın gerçekten açıldığı da görünür olmalı.

Otomasyonun değeri hızında değil, tekrarlanabilir kanıt üretmesindedir.`,
      },
      en: {
        title: 'Trust comes before automation in a developer flow',
        excerpt: 'CI/CD is not only about shipping faster; it is about proving what was shipped.',
        body: `A good developer flow helps people make decisions with less uncertainty, not merely type commands faster. That needs a small set of reliable checks.

Lint, tests, and a build are not enough by themselves. The team should also see which commit reached production, whether required variables exist, and whether the critical flow actually opens.

Automation earns its value by producing repeatable evidence, not just by being fast.`,
      },
    },
  },
  {
    id: 'fallback-teknik-yazarlik',
    slug: 'teknik-yazarlik',
    category: 'Teknik iletişim',
    coverImageUrl: '/images/posts/teknik-yazarlik.webp',
    readingTime: 4,
    publishedAt: '2026-08-01T00:00:00.000Z',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 180,
      environment: ['Teknik yazı incelemesi'],
      prerequisites: ['Karar bağlamı', 'Örnek açıklaması'],
      verificationSteps: ['Okuyucunun vereceği kararı ilk bölümde belirt', 'Örneğin hangi durumda yanlış olacağını yaz'],
      caveats: [],
      sources: [],
    },
    translations: {
      tr: {
        title: 'Teknik yazı, bilgi dökümü değildir',
        excerpt: 'İyi bir teknik anlatı okuyucunun hangi kararı vereceğini baştan netleştirir.',
        body: `Teknik yazıların çoğu kavramları sıralıyor, fakat okuyucunun asıl ihtiyacı olan kararı belirsiz bırakıyor. İyi anlatı önce bağlamı verir, sonra seçenekleri ve bedellerini karşılaştırır.

Bir örnek, yalnızca kod gösterdiğinde öğretici olmaz. Neden bu çözüm seçildi? Hangi durumda yanlış olur? Değiştirilmesi gereken ilk parça hangisi? Bu sorular cevapsızsa örnek kopyalanır ama anlaşılmaz.

Netlik, ayrıntıyı azaltmak değil; ayrıntıyı doğru sıraya koymaktır.`,
      },
      en: {
        title: 'Technical writing is not a data dump',
        excerpt: 'A useful technical story makes the reader’s decision clear before it explains the implementation.',
        body: `Many technical articles list concepts while leaving the reader’s real decision unclear. A useful explanation starts with context, then compares options and their costs.

An example is not educational just because it includes code. Why was this approach chosen? When does it fail? What should change first? Without those answers, people copy the example without understanding it.

Clarity is not less detail. It is putting detail in the right order.`,
      },
    },
  },
  {
    id: 'fallback-urun-telemetrisi',
    slug: 'urun-telemetrisi',
    category: 'Ürün analitiği',
    coverImageUrl: '/images/posts/urun-telemetrisi.webp',
    readingTime: 5,
    publishedAt: '2026-07-31T00:00:00.000Z',
    evidence: {
      level: 'author-tested',
      testedAt: '2026-08-28T00:00:00.000Z',
      staleAfterDays: 180,
      environment: ['Ürün telemetrisi incelemesi'],
      prerequisites: ['Ürün sorusu', 'Ölçülebilir davranış'],
      verificationSteps: ['Event yazmadan önce ürün sorusunu yaz', 'Her metriği desteklediği kararla eşleştir'],
      caveats: [],
      sources: [],
    },
    translations: {
      tr: {
        title: 'Ürün telemetrisi karar vermeyi kolaylaştırmalı',
        excerpt: 'Daha çok event toplamak yerine, hangi ürün kararını destekleyeceğinizi tanımlayın.',
        body: `Analitik sistemlerinde sorun çoğu zaman veri eksikliği değildir. Event isimleri dağınık, sahiplik belirsiz ve ölçümün hangi karara bağlandığı unutulmuştur.

Önce ürün sorusunu yazın: Kullanıcı nerede takılıyor? Hangi akış değer üretiyor? Bir değişiklik başarılı sayılacaksa hangi davranış değişmeli? Sonra yalnızca bu soruları cevaplayan sinyalleri toplayın.

İyi telemetri rapor üretmekten çok, ekip içindeki tartışmayı daha somut hale getirir.`,
      },
      en: {
        title: 'Product telemetry should make decisions easier',
        excerpt: 'Instead of collecting more events, define which product decision the signal should support.',
        body: `The main problem in analytics is often not missing data. Event names drift, ownership becomes unclear, and the decision a measurement was meant to support is forgotten.

Write the product question first: where do users get stuck, which flow creates value, and what behavior should change if the release succeeds? Then collect only the signals that answer those questions.

Good telemetry does more than produce reports. It makes team discussions more concrete.`,
      },
    },
  },
];

const localize = (post, locale) => {
  const translation = post.translations[locale] || post.translations.tr;
  return {
    id: post.id,
    slug: post.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    body: translation.body,
    bodyHtml: '',
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: translation.title,
    category: post.category,
    readingTime: post.readingTime,
    authorId: FALLBACK_AUTHOR.id,
    author: FALLBACK_AUTHOR,
    isPublished: true,
    createdAt: post.publishedAt,
    publishedAt: post.publishedAt,
    updatedAt: post.publishedAt,
    commentCount: 0,
    evidence: post.evidence || null,
    outcome: post.outcome || translation.excerpt,
    isFallback: true,
    source: 'local-fallback',
  };
};

export const getFallbackPosts = (locale = 'tr') => FALLBACK_CATALOG.map((post) => localize(post, locale));

export const getFallbackPost = (identifier, locale = 'tr') => {
  const post = FALLBACK_CATALOG.find((item) => item.slug === identifier || item.id === identifier);
  return post ? localize(post, locale) : null;
};

export const getFallbackUserPosts = (userId, locale = 'tr') => (
  userId === FALLBACK_AUTHOR.id ? getFallbackPosts(locale) : []
);

export const getFallbackStats = () => ({
  posts: FALLBACK_CATALOG.length,
  authors: 1,
  comments: 0,
  isFallback: true,
});
