# Üretim sözleşmesi

1. **Brief:** `npm run new -- --brief ... --id ...` giriş dosyasını ve oturum iş emrini hazırlar. Uzun master prompt gerekmez.
2. **Research:** Codex güvenilir kaynakları tarar; iddiaları ve belirsizlikleri production/research altında kaynak bağlantılarıyla kaydeder. Araştırma olmadan tarihsel iddia üretmez.
3. **Screenwriter:** bir anlatı sorusu, keşif ve sonuç; zamanlı Türkçe narration listesi. Görüntü ile sesin görevlerini ayırır.
4. **Art director:** tekrar kullanılan karakter tasarımı, ortam, çizgi, palet ve ışık kuralları. Her shot'ın görsel amacı üretim dosyasındadır.
5. **Storyboard:** start/end/name/goal verisi. Kamera, page match ve bilimsel hareket aynı timeline ile çalışır.
6. **Assets/animation:** engine matematik, paint, warp ve fizik yardımcıları; film klasörü özgün set, karakter ve içerik. Her kare doğrudan seek(t).
7. **Sound:** Piper yerel çıkarım; lisanslı model. Özgün programatik score, room air ve sayfa sesi. Narration ayrı satır WAV'ları, gerçek uzunluk ölçümü, çok az tempo düzeltmesi ve ortak olaylar.
8. **Draft:** 960×540/30 FPS MP4. Kare sayısı ceil(duration×FPS). FFmpeg hiçbir kareyi gerçek zaman gecikmesi nedeniyle atlamaz.
9. **Review:** shot contact sheet, 2 FPS tüm film, el/sayfa, geçiş, yarış ve dönüş için sık şerit. Yüz/el yakın planları ve kodlanmış MP4 kareleri de açılır. İlk üç ana turla sınırlı; düzeltmeler ve kalan sorunlar kalite raporuna yazılır.
10. **Revision:** en önemli görünür sorunları düzelt; önce/sonra karelerini sakla. Başarılı derleme artistik onay değildir.
11. **Final:** 1080p/30 FPS H.264 High/yuv420p, limited BT.709, AAC 192 kbps, faststart. Teknik doğrulama actual final dosyasına uygulanır.
12. **Delivery:** MP4, kaynak, storyboard, lisans kaydı, kalite raporu ve üretim durumu.

## Otomasyon sınırı

Render, ses sentezi, PNG dizisi, kare çıkarma, contact sheet ve teknik kontroller CLI ile yereldir. Araştırma, yeni senaryo, çizim kodu üretimi ve artistik görüntü değerlendirmesi bu Codex oturumunda yapıldı. Çevrimdışı genel amaçlı LLM/VLM veya ücretli API adaptörü eklenmedi. `new` yalnızca hazırlığı otomatikleştirir; bitmiş bir genel AI film üreticisi olduğunu iddia etmez. Yeni filmin yaratıcı aşamalarını Codex, mevcut motoru kullanarak tamamlar.

## Doğrulama kapsamı

Physics testleri ortak endpoint, enerji modeli, integrable başlangıç singularity, analitik süre, zaman sorgusu ve IK uzunluklarını kontrol eder. Verify final dosyanın tamamını decode eder; frame count/FPS/renk/codec/süre, siyah-boş kare, büyük ardışık kare farkı, browser exception, cold seek hash ve ses slot/event uyumunu kontrol eder. Hareket-fark eşiği artistik doğal hareketin garantisi değildir. Narration dinleme kalitesi otomatik olarak onaylanmaz.
