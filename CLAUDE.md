# CLAUDE.md

Bu dosya, Claude Code'un bu depoda çalışırken izlemesi gereken kuralları ve proje bağlamını tanımlar.

## Proje Özeti

**Albert Hajiverdiyev — Kişisel Portföy Sitesi**

Vite + TypeScript ile geliştirilmiş, çerçevesiz (framework'süz) çok sayfalı statik portföy sitesi ve
bir Express tabanlı yönetim (admin) sunucusu.

**Veri kaynağı artık SQLite'tır** (`server/data/portfolio.db`). Admin paneli veritabanını düzenler ve
yüklenen görselleri diske kaydeder. `src/data.json` sabit bir kaynak değil, veritabanından **üretilen**
bir build çıktısıdır (frontend onu import eder). Ayrıntı için "Veri Mimarisi" bölümüne bakın.

- **Diller:** arayüz `az` / `en` / `tr` (varsayılan: `az`)
- **Paket yöneticisi:** npm (`type: module`)
- **Arayüz framework'ü YOK** — saf DOM + template string (`` innerHTML ``) kullanılır.

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Vite dev sunucusu (frontend) — `0.0.0.0` üzerinde |
| `npm run server` | Express admin sunucusunu izleme modunda başlatır (`tsx watch`) |
| `npm run admin` | Express admin sunucusunu tek seferlik çalıştırır |
| `npm run dev:all` | Admin sunucusu + Vite'ı birlikte başlatır |
| `npm run build` | `tsc` tip kontrolü + `vite build` (çıktı: `dist/`) |
| `npm run preview` | Derlenmiş siteyi önizler |
| `npm run db:migrate` | `server/data/seed.json` → SQLite. Mevcut veritabanının üzerine yazar. |
| `npm run db:export` | SQLite → `src/data.json` (frontend build çıktısı). |

> `predev`, `preserver`, `preadmin`, `prebuild` kancaları otomatik olarak `db:export` çalıştırır;
> böylece frontend her zaman güncel veritabanı içeriğiyle derlenir.

Portlar (geliştirme): Web/Vite `8500`, Admin/API/Express `8501` (`PORT` env değişkeniyle değiştirilebilir).
Vite, `/api` ve `/admin` isteklerini `http://localhost:8501`'e proxy'ler (`API_TARGET` ile değiştirilebilir).

> **Dikkat:** Tarayıcılar bazı portları bloklar (ör. **6000** = X11 → `ERR_UNSAFE_PORT`). Dev portu seçerken
> Chrome'un engellenen portlar listesinden kaçının. Sunucular `::` üzerinde dinler (IPv4 + IPv6 çift yığın),
> böylece `localhost` (IPv6) ve `127.0.0.1` (IPv4) ile erişilebilir.

## Mimari

```
index.html, projects.html, ...   Çok sayfalı Vite girdileri (vite.config.js'te tanımlı)
src/
  main.ts            Ana sayfa (hero, metrikler, öne çıkanlar)
  pages.ts           Diğer sayfaların render mantığı
  shared.ts          header, footer, modal, navigasyon gibi ortak bileşenler
  portfolio-data.ts  Çalışma zamanı veri mağazası: gömülü data.json + loadData() ile /api/data tazeleme
  i18n.ts            az/en/tr dil yönetimi (localStorage: portfolio_lang)
  data.json          ÜRETİLEN çıktı — SQLite'tan üretilir (elle düzenlemeyin!)
  styles.css         Tüm stiller
server/
  index.ts           Express giriş noktası (statik dosya servisi + API)
  db.ts              SQLite veri katmanı (getDb, readAllData, replaceAllData, exportToJson)
  routes/api.ts      /api/* uç noktaları (veri oku/yaz, görsel yükleme, yedekleme, geri yükleme)
  data/
    portfolio.db     SQLite veritabanı — TEK VERİ KAYNAĞI (git'e girmez)
    seed.json        Başlangıç verisi / migration kaynağı (git'e girer)
  public/            Admin paneli (saf HTML/CSS, framework yok)
  backups/           Zaman damgalı otomatik JSON yedekleri (DB anlık görüntüsü)
scripts/
  db-migrate.ts      seed.json → SQLite (npm run db:migrate)
  db-export.ts       SQLite → src/data.json (npm run db:export)
public/
  images/            Yüklenen ve statik görseller
  favicon.svg, Albert-Hajiverdiyev-CV.pdf
```

## Veri Mimarisi (SQLite)

- **Tek doğru kaynak `server/data/portfolio.db`'dir.** `src/data.json` yalnızca frontend'in import
  edebilmesi için üretilen bir kopyadır; asla elle düzenlenmemeli, doğrudan commit edilmemelidir.
- **Neden belge (document) modeli?** Admin panelinden üretilen içerik şemasızdır: aynı koleksiyondaki
  kayıtlar farklı alanlara sahip olabilir (ör. bir projede `liveUrl`, diğerinde `repoName`; bir deneyimde
  `period` düz metin, diğerinde `{az,en,tr}` nesnesi). Sabit/ilişkisel kolonlar bu veriyi bozar.
  Bu yüzden her kayıt JSON olarak saklanır → **kayıpsız round-trip** garanti edilir.
- **Şema:** `site_content(key, value)` tekil bloklar (`ui`, `profile`) için; `items(collection, position,
  item_key, data)` ise tüm listeler (`metrics`, `focusAreas`, `skills`, `skillCategories`, `experiences`,
  `educations`, `languages`, `projects`) için. `position` sırayı, `data` tam JSON'u tutar.
- **API sözleşmesi değişmedi:** `GET/POST /api/data` hâlâ tüm dokümanı alıp döner. POST, veritabanına
  transaction ile yazar ve `src/data.json`'u yeniden üretir.
- **Yedekleme:** Her yazma öncesi veritabanının JSON anlık görüntüsü `server/backups/` altına yazılır;
  `/api/restore/:filename` bu JSON'u tekrar veritabanına yükler.

### Admin → Web entegrasyonu (önemli)

Frontend, veriyi **çalışma zamanında** API'den çeker; böylece admin panelinde kaydedilen içerik
sayfa yenilendiğinde sitede anında görünür.

- `src/portfolio-data.ts` bir **canlı mağazadır**: başlangıç değeri build'e gömülü `data.json`,
  `loadData()` ile `/api/data`'dan tazelenir ve `let` export'lar (canlı binding) güncellenir.
- `main.ts` / `pages.ts` render işlemini **`await loadData()` sonrasına erteler** — bu render
  fonksiyonunu bozmanın, veri gelmeden çizim yapılmasına yol açacağını unutmayın.
- API'ye erişilemezse (statik barındırma) sessizce gömülü veriye düşer; site çalışmaya devam eder.
- Vite (dev **ve** preview) `/api` ve `/admin` isteklerini `API_TARGET` adresine proxy'ler
  (varsayılan `http://localhost:8501`). Uzak API için `VITE_API_BASE` kullanılabilir.
- Admin panel `http://localhost:<api-port>/admin` adresindedir; dev'de web portu üzerinden de proxy ile açılır.

## Veri Akışı ve Kurallar

- **İçerik SQLite'ta yaşar** (`server/data/portfolio.db`). Metinleri `.ts` ya da `.html` içine gömme;
  yeni içerik ve çeviriler veritabanına eklenir, frontend'e `portfolio-data.ts` (→ `src/data.json`)
  üzerinden ulaşır. Toplu içerik güncellemesi için: `seed.json`'u düzenle → `npm run db:migrate`.
- **Çok dilli içerik:** Çevrilen her metin `{ "az": ..., "en": ..., "tr": ... }` şeklinde tutulur ve
  render sırasında `t(...)` fonksiyonu ile çözülür. Yeni metin eklerken **üç dili de** doldur.
- Veritabanına yazıldığında API otomatik olarak `server/backups/` altına zaman damgalı JSON yedek alır.
- Görsel yüklemeleri `public/images/` içine gider (maks. 15 MB; png/jpg/webp/svg/gif/avif).
- Statik görsel yolu `/images/...` şeklindedir.

## Geliştirme Tarzı

- Mevcut koda uy: saf fonksiyonlar, template string ile HTML üretimi, harici UI kütüphanesi ekleme.
- **Arayüzde emoji kullanma.** İkonlar için `shared.ts` içindeki `icon('mail'|'phone'|'github'|'linkedin'|'pin')`
  yardımcısını kullan (satır içi, `currentColor` çizgi SVG). Tasarım dili sade/editoryal kalsın.
- Yeni bir sayfa eklerken: `vite.config.js` içindeki `build.rollupOptions.input` listesine de ekle
  ve `shared.ts` navigasyonunda bağlantısını ver.
- Türkçe/Azerice karakterlerde UTF-8 kullan; dosya kodlaması UTF-8 olmalı.
- TypeScript `strict` modda (`tsconfig.json`); `any` kullanımından kaçın, tipleri `data.json`
  şekline göre tanımla.
- Kullanıcıya dönük metinlerde kod içi yorum/dizge az dilinde (veya İngilizce) mevcut kalıbı korur.

## Yapılmaması Gerekenler

- `dist/`, `server/backups/` veya `node_modules/` içini elle düzenleme (üretilen dosyalar).
- **`src/data.json`'u elle düzenlemeyin** — üretilen çıktıdır; değişiklik SQLite'a yazılmalıdır.
- **`server/data/portfolio.db`'yi silip/kopyalayıp yönetmeyin** — şema/erişim `server/db.ts` üzerindendir.
- SQLite yerine paralel bir içerik kaynağı (yeni JSON/DB) oluşturma; tek kaynak veritabanıdır.
- Yeni bağımlılık eklemeden önce mevcut çözümün yetersizliğinden emin ol (SQLite yerleşik: `node:sqlite`).
- `dist/` çıktısını commit etme (yalnızca `npm run build` ile üretilir).
