# Kaynak incelemesi — 16 Ekim 2026

Dört depo doğrudan `git clone --depth 1` ile indirildi. Kod çalıştırılmadan önce render, CDP bağlantısı, dosya sunucusu, doğrulama ve karakter/ses rehberleri okundu. Hiçbir depodaki yükleme betiği veya npx skill kurulumu çalıştırılmadı. Tam kaynak anlık görüntüleri vendor/ içinde bulunur. Lisanssız referans dosyaları yalnızca inceleme kopyasıdır, ürüne alınmamıştır.

## Opus JS Animations

Kaynak: https://github.com/klsoen/opus-js-animations

- İncelenen SHA: be8d5792ffff563c9dc62933bbe5627ac41a89e0.
- Son commit: 2026-10-03T11:14:15+02:00.
- LICENSE gerçekten mevcut: MIT, Copyright 2026 klsoen.
- `skills/opus-js-animations/scripts/lib.mjs`: Node 22 fetch/WebSocket üzerinden CDP; yerel HTTP dosya sunucusu; __film sözleşmesi.
- `scripts/render.mjs`: iki paralel Chromium, ham RGBA POST, FFmpeg, BT.709, H.264, AAC mux; PNG legacy yolu da var.
- `scripts/verify.mjs`: aynı zaman ve başka zamana gittikten sonra aynı zaman için görüntü hash'i.
- `scripts/stills.mjs`: kare, şerit, contact sheet araçları mevcut.
- `references/design.md`, `directing.md`, `production.md`, `audio.md`: sanat, yönetmenlik ve ses süreçleri; hazır Galileo çizimi veya genel amaçlı tam rig motoru değil.
- Seslendirme betiği ücretli sağlayıcılar içeriyor; kullanılmadı. Kaynak süreçteki tekrar tekrar onay alma adımları kullanıcının otonom çalışma talebi doğrultusunda uygulanmadı.
- Çalıştırılabilirlik: Windows Chrome adayları yoktu; CHROME ile Playwright Chromium bağlandı. URL yolu Windows'ta slash'ları yanlış encode ediyordu; düzeltildi. FFmpeg/FFprobe executable yolları ve concat dosya ayraçları düzeltildi. Encoder/senkron komut hata kontrolleri eklendi. 10 saniyelik iki MP4 ve tam 48 saniyelik MP4 gerçekten üretildi.
- Yeniden kullanım: lib/render/verify kaynakları MIT bildirimiyle tools/upstream/ altına otomatik kopyalanır. Değişikliklerin kaynağı tools/setup.mjs.

## JavaScript Animation Skills

Kaynak: https://github.com/iart-ai/javascript-animation-skills

- SHA: f7d0882a313249cbd43f0e4e9e209b1622870253.
- Son commit: 2026-09-30T19:40:39+08:00.
- MIT lisansı mevcut.
- İki gerçek skill paketi: javascript-animation ve soundtrack. Tek dosyalı film örnekleri examples/ altında mevcut.
- `references/character.md`: tek tasarım fonksiyonu, bağımsız karakter denetimi, el/ağız/nesne bağlantı noktaları.
- `references/techniques.md`: path dolgu, hatch, gravür, sabit seed doku; tekniklerin hangilerinin sadece still olarak test edildiği belirtiliyor.
- `references/storyboard.md`: ortak SHOTS/EVENTS ve dünya devamlılığı; kamera ile sahnenin ayrılması.
- `references/qc.md`, `scripts/layout-check.mjs`, `asset-audit.mjs`: otomatik ve gözle denetim ayrımı.
- `soundtrack/scripts/sync-check.mjs`: video hareketi ve ses onset ölçümü; senaryolu sessiz aralıklar için otomatik artistik hüküm yerine olay sözleşmesi tercih edildi.
- Kullanım: karakter bağlantıları, hatch yaklaşımı, ortak olay çizelgesi ve kalite akışı benimsendi. Hazır filmleri kopyalamadık; ses şablonları müziğe alınmadı. Bu depodaki alternatif renderer ayrıca çalıştırılmadı; çalışıyor diye işaretlenmiyor.

## Motion Skills

Kaynak: https://github.com/iart-ai/motion-skills

- SHA: bb5a3ce666110855a3437de2f70e9968c408e005.
- Son commit: 2026-10-14T22:10:05+08:00.
- MIT lisansı mevcut.
- README 18 ayrı pakete yönlendirir; bu checkout tek başına tüm paketleri içermiyor.
- tools/verify altında probe-mp4.sh, seek-shot.sh, contact-sheet.sh var; Bash/FFmpeg varsayıyor. Windows üretiminde doğrudan çalıştırılmadılar; eşdeğer kontroller Node/Python ile kuruldu.
- Hazır karakter üretimi, yerel TTS veya genel storyboard AI servisi bulunmuş gibi değerlendirilmedi.

## Generative Illustration Skills

Kaynak: https://github.com/iart-ai/generative-illustration-skills

- SHA: e7d62437c875fc8ad5eff6e90fe0e25b30e43933.
- Son commit: 2026-06-30T22:47:25+08:00.
- Bu checkout'ta LICENSE dosyası bulunmadı; açık lisans varsayılmadı.
- Gerçek dosyalar: SKILL.md, references/asset-pipeline.md, craft.md, render-harness.md.
- Ana tarif OpenRouter üzerinden Recraft, Gemini image ve Lyria kullanıyor. Ücretsiz yerel üretim çözümü değil.
- Bağımsız küçük görsel katmanlarla animasyon fikri yararlı; kodu ve ücretli API yolu projeye alınmadı. Bu paketin AI asset üretimi çalıştırılmadı.

## Bağımlılık ve güvenlik sonucu

Yerel loopback HTTP sunucusu, dışarı dosya göndermeyen Chromium render ve shell interpolation kullanmayan spawn/execFile çağrıları kullanılıyor. npm kurulumu `--ignore-scripts` ile yapıldı; npm audit bu kurulumda sıfır zafiyet raporladı. Bu sonuç tam güvenlik veya lisans sertifikasyonu değildir. FFmpeg ve model dosyaları yerel araç/model dizinlerinde tutuluyor; hiçbir API anahtarı istenmedi.
