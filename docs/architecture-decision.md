# ADR 001 — Zaman tabanlı Canvas 2D

Durum: uygulanmış. Karar tarihi: 16 Ekim 2026. Deney çıktıları: renders/comparison/a.mp4 ve b.mp4, her biri 960×540, 30 FPS, 300 kare, 10 saniye.

## Kontrollü deney

A saf Canvas path çizimidir. B aynı özgün karakterin baş ve gövdesini şeffaf bitmap katmanlarına otomatik dönüştürür; aynı rig, ortam, kitap, sayfa ve kamera animasyonu kullanılır. Baş/gövde PNG'leri films/galileo/assets/layers içinde dışa aktarılır. Dolayısıyla test yeni bir üretken görüntü modelinin estetik üstünlüğünü ölçmez; katmanlı temsil ile doğrudan çizimi kontrollü biçimde karşılaştırır. Ortam cache'i iki varyantta da aynıdır.

İlk ölçümde 120 zaman noktasında ortalama çizim A 5,48 ms, B 4,82 ms çıktı. Bu tek makine/single-run CPU çizim ölçümüdür, genellenmiş performans garantisi değildir. İki video ve seçili zaman kareleri gerçekten üretildi. Son ölçüm review/comparison/metrics.json içindedir; sonraki revizyonlarda değerler değişebilir.

Son karakter revizyonundan sonraki tekrar ölçümü, eşzamanlı taslak render yükü altında A 7,70 ms ve B 6,38 ms oldu. İlk ölçümle hız artışı/azalışı olarak kıyaslanmaz; yük kontrollü değildir. B'nin editability ve estetik açısından üstünlüğü yine gösterilmedi.

## Sekiz kriter

- Estetik: aynı kaynak çizim sebebiyle iki yöntem benzer; hibrit bitmap kendi başına estetik katkı sağlamadı. Her ikisi stilize bir illüstrasyon, fotogerçekçilik hedeflenmiyor.
- Karakter tutarlılığı: aynı tek tasarım iki yöntemde de korunuyor.
- Hareket doğallığı: ortak rig aynı kısıtları taşıyor; sprite kullanmak anatomiyi veya acting'i otomatik iyileştirmiyor.
- Işık: Canvas glow/gradient katmanları iki yöntemde de aynı; bitmap ışığa göre boyanacaksa ek varyant gerekir.
- Nesne etkileşimi: bitmap değil, bilek/page anchor hesabı belirleyici. İlk testteki temas sorunu iki yöntemde de vardı; film revizyonunda ortak motion modülüyle düzeltildi.
- Kamera: iki yaklaşım deterministik transform ve parallax'a uygun; bitmap yakın planda raster sınırına daha erken ulaşır.
- AI ile düzenleme: path, hatch, palet ve bağlantılar saf kodda daha yerel olarak düzenlenebilir. Bitmap yeniden pişirilmeli.
- Genellenebilirlik: saf kod yeni sahnelerde motoru korur ama yeni içerik çizimi gerektirir; hibrit iyi dış görsellerle daha zengin olabilir. Bu ortamda doğrulanmış yerel görüntü modeli yok; bağımsız yüksek kaliteli hibrit üstünlüğü gösterilmedi.

Sayısal estetik puanı uydurulmadı. Seçilen yöntem **saf kod + değişmeyen ortam/doku cache'i**. Tam filmi iki kez üretmiyoruz.

## Aday teknolojiler

Canvas 2D fiilen test edildi ve seçildi. Motion Canvas, PixiJS, Paper.js, GSAP, Three.js ve Remotion bu projede kurulup benchmark edilmedi. Bu adaylar kötü veya yetersiz diye elenmedi; mevcut 2D set/rig ve dışarıdan seek kontrolü için yeni bağımlılık gerektirmedikleri gösterilmedi. İleride çok sayıda sprite, shader ışığı veya tipografik React sahneleri gerektiğinde ayrı küçük testle yeniden değerlendirilebilirler.

## Birleştirilen parçalar

Opus'un MIT CDP/ham kare renderer'ı + Windows adaptasyonları; iart'ın tek karakter tasarımı/bağlantı noktası, görsel-işitsel ortak olay çizelgesi ve gerçek contact sheet/şerit denetimi. Üzerine özgün çizimler, IK, sayfa/bilek bağlama, kamera/sayfa dönüşümü, bilimsel quadrature, yerel TTS/müzik mix ve final MP4 doğrulaması eklendi.

## Bedeller

Prosedürel rig sınırlı poz/ifade çeşitliliğine sahip. Otomatik kurallar sinematik kaliteyi kanıtlayamaz; Codex'in görüntü açıp değerlendirdiği oturum aşaması gerekir. Yerel Piper sesi insan anlatıcının doğallığına eşdeğer sayılmıyor. Yeni bir konu için yaratıcı AI aşamaları npm komutunun içinde gizli değildir; Codex oturumunun işi olarak açıktır.
