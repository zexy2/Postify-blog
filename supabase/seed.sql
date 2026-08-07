-- Postify curated seed content.
-- Run after the base and content-model migrations.
-- If no profile exists yet, posts are published with a null author_id and the
-- UI presents the honest fallback name "Postify Editor". A later signup can
-- create a real profile without blocking the initial editorial launch.

with editor as (
  select id from public.profiles order by created_at nulls last limit 1
), seed(slug, category, cover_image_url, reading_time, title, excerpt, body) as (
  values
    ('ai-muhendisligi', 'AI', '/images/posts/ai-muhendisligi.webp', 7,
      'AI özelliği eklemekten önce çözülmesi gereken beş soru',
      'Bir modele bağlanmak kolay; doğru problemi seçmek, ölçmek ve güvenli bir ürün davranışına dönüştürmek asıl iştir.',
      'Yapay zekâ özelliği planlarken ilk soru hangi modeli kullanacağımız değil, kullanıcının hangi kararını daha iyi vereceğidir. Bu ayrım yapılmadığında ürün yalnızca pahalı bir metin kutusuna dönüşür.\n\nİkinci adım başarı ölçüsünü yazmaktır. Yanıt kalitesi kadar bekleme süresi, hata oranı, maliyet ve insanın müdahale ettiği anlar da ölçülmelidir. Üçüncü adım ise başarısızlık davranışıdır: model emin değilse bunu saklamamalı, kullanıcıya anlaşılır bir alternatif sunmalıdır.\n\nİyi AI ürünü model demosu değil, sınırları belli bir iş akışıdır.'),
    ('web-standartlari', 'Web', '/images/posts/web-standartlari.webp', 6,
      'Web platformunu seçmek, framework seçmekten daha değerlidir',
      'Standart HTML, erişilebilirlik ve tarayıcı yetenekleri ürünün ömrünü uzatır; framework seçimi bundan sonra gelir.',
      'Bir arayüzü hızlandırmanın en ucuz yolu daha fazla paket eklemek değildir. Önce semantik HTML, doğru form kontrolleri, native gezinme ve tarayıcının zaten çözdüğü işleri kullanmak gerekir.\n\nBu yaklaşım performansı artırırken bakım maliyetini de düşürür. Bir komponent kütüphanesi değişebilir; başlık hiyerarşisi, link davranışı ve klavye erişimi ise ürünün temel sözleşmesidir.\n\nFramework, bu sözleşmeyi görünür ve sürdürülebilir kılıyorsa değerlidir. Platformun yerine geçiyorsa borç üretir.'),
    ('frontend-performansi', 'Frontend', '/images/posts/frontend-performansi.webp', 8,
      'Frontend performansı için önce kullanıcı yolculuğunu ölçün',
      'Lighthouse skoru bir sonuçtur. Asıl hedef, gerçek kullanıcının ilk anlamlı etkileşime daha hızlı ulaşmasıdır.',
      'Performans çalışmasına bundle grafiğiyle başlamak çoğu ekipte yanlış öncelik yaratır. Önce kritik yolu yazın: kullanıcı hangi sayfayı açıyor, ilk neyi görmeli ve hangi eylemi yapabilmeli?\n\nArdından LCP, INP ve CLS değerlerini bu yol üzerinde takip edin. Büyük görselleri doğru ölçekte sunmak, gereksiz JavaScripti ertelemek ve font yükünü azaltmak genellikle mikro optimizasyonlardan daha büyük fark yaratır.\n\nÖlçüm yoksa optimizasyon yalnızca sezgidir; sezgi de mobil ağlarda çoğu zaman yanılır.'),
    ('urun-tasarimi', 'Ürün tasarımı', '/images/posts/urun-tasarimi.webp', 7,
      'Tasarım sistemi renk paleti değil, karar verme sistemi',
      'İyi bir sistem aynı ekranı tekrar etmez; farklı ekiplerin aynı kalite çıtasında karar vermesini sağlar.',
      'Tasarım sistemleri çoğunlukla token listeleri ve komponent sayfalarıyla başlatılıyor. Bunlar gerekli ama tek başına sistem değil. Sistem; ne zaman hangi komponentin seçileceğini, hangi durumda istisna açılacağını ve başarının nasıl değerlendirileceğini de anlatır.\n\nİsimlendirme kadar içerik kuralları önemlidir. Bir butonun metni, bir hata mesajının sorumluluğu ve boş durumun sonraki adımı tanımlı değilse görsel tutarlılık gerçek ürün tutarlılığına dönüşmez.\n\nEn iyi sistem tasarımcıyı ve geliştiriciyi hızlandırırken kullanıcıya daha az sürpriz yaşatır.'),
    ('edge-mimarileri', 'Altyapı', '/images/posts/edge-mimarileri.webp', 6,
      'Edge mimarisi her probleme cevap değildir',
      'Dağıtık çalıştırma kararını moda olduğu için değil, gecikme ve veri sınırları gerçekten bunu gerektirdiğinde verin.',
      'Edge dağıtımı bazı istekleri kullanıcıya yaklaştırır; fakat gözlemlenebilirlik, veri tutarlılığı ve hata ayıklama maliyetini artırabilir. Bu yüzden ilk soru hangi sağlayıcı değil, gecikmenin hangi bölümünün kullanıcı deneyimini bozduğudur.\n\nÖnbelleklenebilir içerik, bölgesel hesaplama ve kişisel veri aynı çözümle ele alınmamalı. Her birinin tazelik ve güvenlik sınırı ayrıdır.\n\nBasit bir origin ve iyi bir cache politikası yeterliyse edge katmanı eklemek mimari kalite değil, ek operasyon demektir.'),
    ('gelistirici-akisi', 'Geliştirici araçları', '/images/posts/gelistirici-akisi.webp', 5,
      'Geliştirici deneyiminde hız, komut sayısını azaltmaktan fazlasıdır',
      'İyi DX; doğru bağlam, hızlı geri bildirim ve güven veren otomasyonun birlikte çalışmasıdır.',
      'Bir projenin geliştirici deneyimini yalnızca kurulum süresiyle ölçmek eksik kalır. Kod değişikliğinin sonucu ne kadar çabuk görülüyor, hatanın kaynağı ne kadar açık ve ekipteki bilgi ne kadar kolay paylaşılıyor?\n\nKüçük ama güvenilir komutlar, belirgin klasör sınırları ve CI üzerinde tekrarlanan kontroller bu sorulara doğrudan cevap verir.\n\nOtomasyonun amacı geliştiriciyi terminalden uzaklaştırmak değil, belirsiz işleri azaltmaktır.'),
    ('teknik-yazarlik', 'İş akışı', '/images/posts/teknik-yazarlik.webp', 5,
      'Teknik yazı yazmak, düşünceyi test etmenin bir yoludur',
      'Bir kararı sade biçimde anlatamıyorsanız, o kararın varsayımlarını henüz yeterince ayırmamış olabilirsiniz.',
      'İyi teknik metin yalnızca çözümü kaydetmez; bağlamı, reddedilen seçenekleri ve geri dönüş koşullarını da görünür kılar. Böylece birkaç ay sonra aynı tartışma yeniden başlamaz.\n\nMetni yazarken önce okuyucunun hangi kararı vereceğini belirleyin. Sonra kanıtı, riski ve açık kalan soruyu ayırın. Uzunluk değil, karar verilebilirlik önemlidir.\n\nDokümantasyon yaşayan bir ürün parçasıdır; güncellenmiyorsa arşiv değil, yanlış yönlendirme üretir.'),
    ('urun-telemetrisi', 'Performans', '/images/posts/urun-telemetrisi.webp', 7,
      'Ürün telemetrisi sayı toplamak değil, belirsizliği azaltmaktır',
      'Her olayı kaydetmek yerine hangi kararın daha güvenli verileceğini düşünün.',
      'Telemetri tasarımında ilk refleks bütün tıklamaları toplamaktır. Oysa çok sayıda olay, doğru sorular cevaplanmadığında yalnızca gürültü üretir.\n\nÖnce ürün hipotezini yazın, sonra ölçümün karar üzerindeki etkisini tanımlayın. Kimlik, saklama süresi ve erişim izinleri de ölçüm planının bir parçasıdır.\n\nİyi analitik sistem pazarlama raporunu değil, ekip içindeki belirsizliği azaltır; ürünün hangi noktada zorlandığını gösterir ve bir sonraki deneyi netleştirir.')
)
insert into public.posts (slug, title, body, excerpt, category, cover_image_url, reading_time, author_id, is_published, published_at)
select seed.slug, seed.title, seed.body, seed.excerpt, seed.category, seed.cover_image_url, seed.reading_time, (select id from editor), true, now()
from seed
on conflict (slug) do update set
  title = excluded.title,
  body = excluded.body,
  excerpt = excluded.excerpt,
  category = excluded.category,
  cover_image_url = excluded.cover_image_url,
  reading_time = excluded.reading_time,
  author_id = excluded.author_id,
  is_published = true,
  published_at = now(),
  updated_at = now();

with translations(slug, locale, title, excerpt, body) as (
  values
    ('ai-muhendisligi', 'tr', 'AI özelliği eklemekten önce çözülmesi gereken beş soru', 'Bir modele bağlanmak kolay; doğru problemi seçmek, ölçmek ve güvenli bir ürün davranışına dönüştürmek asıl iştir.', 'Yapay zekâ özelliği planlarken ilk soru hangi modeli kullanacağımız değil, kullanıcının hangi kararını daha iyi vereceğidir. Bu ayrım yapılmadığında ürün yalnızca pahalı bir metin kutusuna dönüşür. İkinci adım başarı ölçüsünü yazmaktır. Yanıt kalitesi kadar bekleme süresi, hata oranı, maliyet ve insanın müdahale ettiği anlar da ölçülmelidir. Üçüncü adım ise başarısızlık davranışıdır: model emin değilse bunu saklamamalı, kullanıcıya anlaşılır bir alternatif sunmalıdır. İyi AI ürünü model demosu değil, sınırları belli bir iş akışıdır.'),
    ('ai-muhendisligi', 'en', 'Five questions to answer before adding an AI feature', 'Connecting a model is easy; choosing, measuring, and safely productizing the right problem is the work.', 'The first question when planning an AI feature is not which model to use, but which user decision should improve. Without that distinction, a product becomes an expensive text box. Define success with quality, latency, error rate, cost, and human intervention. A good AI product is not a model demo; it is a workflow with clear boundaries.'),
    ('web-standartlari', 'tr', 'Web platformunu seçmek, framework seçmekten daha değerlidir', 'Standart HTML, erişilebilirlik ve tarayıcı yetenekleri ürünün ömrünü uzatır; framework seçimi bundan sonra gelir.', 'Bir arayüzü hızlandırmanın en ucuz yolu daha fazla paket eklemek değildir. Önce semantik HTML, doğru form kontrolleri, native gezinme ve tarayıcının zaten çözdüğü işleri kullanmak gerekir. Framework, bu sözleşmeyi görünür ve sürdürülebilir kılıyorsa değerlidir. Platformun yerine geçiyorsa borç üretir.'),
    ('web-standartlari', 'en', 'Choosing the web platform matters more than choosing a framework', 'Semantic HTML, accessibility, and browser capabilities extend a product’s life; the framework comes after that.', 'The cheapest way to improve an interface is not to add more packages. Start with semantic HTML, correct form controls, native navigation, and capabilities the browser already provides. A framework is valuable when it makes this contract sustainable. It creates debt when it replaces the platform.'),
    ('frontend-performansi', 'tr', 'Frontend performansı için önce kullanıcı yolculuğunu ölçün', 'Lighthouse skoru bir sonuçtur. Asıl hedef, gerçek kullanıcının ilk anlamlı etkileşime daha hızlı ulaşmasıdır.', 'Performans çalışmasına bundle grafiğiyle başlamak yanlış öncelik yaratır. Önce kritik yolu yazın: kullanıcı hangi sayfayı açıyor, ilk neyi görmeli ve hangi eylemi yapabilmeli? LCP, INP ve CLS değerlerini bu yol üzerinde takip edin. Ölçüm yoksa optimizasyon yalnızca sezgidir.'),
    ('frontend-performansi', 'en', 'Measure the user journey before optimizing frontend performance', 'A Lighthouse score is an output. The real goal is helping a real user reach the first meaningful interaction faster.', 'Starting with a bundle chart often creates the wrong priority. Map the critical path first: which page opens, what must appear, and which action must work? Track LCP, INP, and CLS along that path. Without measurement, optimization is only intuition.'),
    ('urun-tasarimi', 'tr', 'Tasarım sistemi renk paleti değil, karar verme sistemi', 'İyi bir sistem aynı ekranı tekrar etmez; farklı ekiplerin aynı kalite çıtasında karar vermesini sağlar.', 'Tasarım sistemi yalnızca token listesi ve komponent sayfası değildir. Ne zaman hangi komponentin seçileceğini, hangi durumda istisna açılacağını ve başarının nasıl değerlendirileceğini de anlatır. En iyi sistem ekibi hızlandırırken kullanıcıya daha az sürpriz yaşatır.'),
    ('urun-tasarimi', 'en', 'A design system is a decision system, not a color palette', 'A good system does not repeat screens; it helps different teams make decisions at the same quality bar.', 'A design system is more than tokens and component pages. It also explains when to choose a component, when an exception is justified, and how success is evaluated. The best system speeds up the team while giving users fewer surprises.'),
    ('edge-mimarileri', 'tr', 'Edge mimarisi her probleme cevap değildir', 'Dağıtık çalıştırma kararını moda olduğu için değil, gecikme ve veri sınırları gerçekten bunu gerektirdiğinde verin.', 'Edge dağıtımı bazı istekleri kullanıcıya yaklaştırır; fakat gözlemlenebilirlik, veri tutarlılığı ve hata ayıklama maliyetini artırabilir. Önbelleklenebilir içerik, bölgesel hesaplama ve kişisel veri aynı çözümle ele alınmamalı. Basit bir origin yeterliyse edge katmanı ek operasyon demektir.'),
    ('edge-mimarileri', 'en', 'Edge architecture is not an answer to every problem', 'Choose distributed execution when latency and data boundaries require it, not because it is fashionable.', 'Edge deployment can move requests closer to users, but it also raises observability, consistency, and debugging costs. Cacheable content, regional computation, and personal data need different boundaries. If a simple origin works, adding edge is extra operations.'),
    ('gelistirici-akisi', 'tr', 'Geliştirici deneyiminde hız, komut sayısını azaltmaktan fazlasıdır', 'İyi DX; doğru bağlam, hızlı geri bildirim ve güven veren otomasyonun birlikte çalışmasıdır.', 'Bir projenin geliştirici deneyimini yalnızca kurulum süresiyle ölçmek eksik kalır. Değişikliğin sonucu ne kadar çabuk görülüyor, hatanın kaynağı ne kadar açık ve bilgi ne kadar kolay paylaşılıyor? Otomasyonun amacı belirsiz işleri azaltmaktır.'),
    ('gelistirici-akisi', 'en', 'Developer experience is more than reducing command count', 'Good DX combines context, fast feedback, and automation people can trust.', 'Installation time is not enough to measure developer experience. How quickly is a change visible, how clear is the source of an error, and how easily is knowledge shared? Automation should reduce uncertainty, not hide the terminal.'),
    ('teknik-yazarlik', 'tr', 'Teknik yazı yazmak, düşünceyi test etmenin bir yoludur', 'Bir kararı sade biçimde anlatamıyorsanız, o kararın varsayımlarını henüz yeterince ayırmamış olabilirsiniz.', 'İyi teknik metin çözümü, bağlamı, reddedilen seçenekleri ve geri dönüş koşullarını da görünür kılar. Önce okuyucunun hangi kararı vereceğini belirleyin; sonra kanıtı, riski ve açık soruyu ayırın. Uzunluk değil, karar verilebilirlik önemlidir.'),
    ('teknik-yazarlik', 'en', 'Technical writing is a way to test your thinking', 'If you cannot explain a decision simply, its assumptions may not be separated clearly enough yet.', 'Good technical writing makes the context, rejected alternatives, and rollback conditions visible. Start with the decision the reader needs to make, then separate evidence, risk, and open questions. Decisionability matters more than length.'),
    ('urun-telemetrisi', 'tr', 'Ürün telemetrisi sayı toplamak değil, belirsizliği azaltmaktır', 'Her olayı kaydetmek yerine hangi kararın daha güvenli verileceğini düşünün.', 'Telemetri tasarımında ilk refleks bütün tıklamaları toplamaktır. Çok sayıda olay doğru sorular cevaplanmadığında gürültü üretir. Önce ürün hipotezini, sonra ölçümün karar üzerindeki etkisini tanımlayın. İyi analitik sistem bir sonraki deneyi netleştirir.'),
    ('urun-telemetrisi', 'en', 'Product telemetry is about reducing uncertainty, not collecting numbers', 'Instead of recording every event, decide which decision should become safer.', 'The first reflex in telemetry design is to collect every click. Many events create noise when they do not answer a clear question. Define the product hypothesis and the measurement’s decision impact first. Good analytics clarifies the next experiment.')
)
insert into public.post_translations (post_id, locale, title, excerpt, body)
select p.id::text, translations.locale, translations.title, translations.excerpt, translations.body
from public.posts p
join translations on translations.slug = p.slug
on conflict (post_id, locale) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  updated_at = now();
