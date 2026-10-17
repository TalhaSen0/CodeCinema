# İlişki laboratuvarı — ilk uygulama

16 Ekim 2026. Sözleşme: [quality-contract.md](quality-contract.md).

## Yapılan değişiklik

`engine/relationships.mjs` ortak parent/world/camera dönüşümlerini, yerel kavrama
noktalarını, UV yüzey noktalarını, sahiplik dönüşümünü ve bildirimsel çizim sırasını
çözer. `engine/quality.mjs` ölçümleri kusur sınıflarına ayırır ve kanıt kapısını
hesaplar. Eksik zorunlu kanıt teslimi durdurur; artistik inceleme ayrı kalır.

`films/relationship-lab/` altı saniyelik, mutlak zamandan türetilen bir deneydir.
Üç ölçü/açı/nesne genişliği/yüzey oranında uzanma, kavrama, taşıma, bırakma,
projektif kamera değişimi, direk arkasından geçme ve yüzey bükülmesi üretir.
Bu üç varyasyon üç tamamlanmış kısa film veya üç bağımsız karakter rig'i değildir.

## Çalıştırılan kontroller

Komut: `npm run review:relationships`.

- 20 birim/regresyon testi geçti.
- Üç varyasyonda 721'er geometri örneği (120 Hz) ve iki sahiplik sınırı geçti.
- Altı hata sınıfı × üç varyasyon: 18/18 kasıtlı kusur yakalandı.
- Gerçek canvas rasterında dokuz bozuk ve üç temiz örnek beklenen sonucu verdi.
- Bu test kümesinde kaçırma ve yanlış alarm sıfır. Gerçek filmler için recall iddiası yok.
- 15 zaman/varyasyon örneğinde tekrarlı ve yeniden yükleme sonrası seek hash'leri aynı.
- Üç gerçek H.264 klip: 1920×1080, 30 FPS, 6 saniye, 180 kare; tamamı decode edildi.
- Galileo v2'nin gerçek 48 saniyelik videosu doğrulandı; 34 yüzey landmark'ında
  en büyük raster farkı 0.534 px. Önceki MP4, mix ve narration hash'leri değişmedi.

Makine kanıtı: `review/relationships/verification.json`, `encoded.json`,
`baseline.json`, `galileo-verification.json`, `surface-verification.json`.
Klipler: aynı dizindeki `courier.mp4`, `mechanic.mp4`, `archivist.mp4`.

## Görsel inceleme ve düzeltmeler

Browser görüntüleri ve son kodlanmış kliplerin 18 yoğun şeridinin tümü açılarak
incelendi (15 Hz örnekleme, 0–5.933 s; video decode kontrolü tüm 30 FPS karelerde).
İlk turda kamera koordinat normalizasyonu düzeltildi. Görsel incelemede baş-boyun
boşluğu giderildi; sonraki turda ayrı yüzey deneyinin taşıma alanına girmesi
giderildi. Son kliplerde yüzey ve taşıma alanı ayrıdır; sahiplik devrinde gözlenen
ani konum sıçraması yoktur. Eşikler bu düzeltmeleri geçirmek için değiştirilmedi.

Renkli işaretler denetim içindir. Gövde üst kolun bir kısmını gizler; bu sade kukla
anatomik oyunculuk örneği değildir. Yüzey havada duran bir test fikstürüdür.
Klipler sessizdir. Estetik insan onayı verilmediği için kapı `review-required` kalır.

## Kalan kapsam

Otomatik denetim yalnız ilan edilen anchor, sınır ve örtüşme noktalarını ölçer.
Tüm piksellerde semantik yanlış örtüşme, parmak kapanışı, hacimsel çarpışma,
gerçek 3D kamera orbit'i ve yüz oyunculuğu çözülmüş değildir. Otomatik onarım yoktur.
Bu kapı laboratuvar komutuna bağlıdır; eski `render:final` akışının yerine geçmez.
Yeni filmler için ölçüm bildirimleri ve kapı entegrasyonu ayrıca gerekir.

Galileo sanatına yeni ilişki altyapısı topluca taşınmadı. Sonraki aşama: birden
fazla kısa anlatıda farklı rig ve nesneler; insan incelemesinin bulduğu kaçırmaları
test kümesine ekleyerek kapsamı büyütmek. Yeni renderer kararı için henüz gerekçe yok.
