# Üretim kaydı

Başlangıç: 15 Ekim 2026; teslim oturumu: 16 Ekim 2026 (Europe/Istanbul). Çalışma dizini başlangıçta boştu.

1. **Kaynak inceleme:** dört repo indirildi, SHA/tarih/lisans/dosyalar kaydedildi. Çalıştırılacak Opus render/lib kaynakları önceden okundu. Lisanssız/ücretli ana yöntem referansı ürüne alınmadı.
2. **Teknoloji karşılaştırması:** 10 saniyelik aynı çalışma odasında iki gerçek 30 FPS MP4. Saf çizim ve otomatik raster katmanları; yeni görüntü modeli benchmark'ı değil. Kareler açıldı, performans ölçüldü.
3. **Mimari karar:** Canvas 2D + Opus renderer + iart karakter/event/quality ilkeleri. ADR yazıldı; diğer render framework'lerinin benchmark edilmediği açıklandı.
4. **Motor:** seeded matematik, path/hatch/doku, IK, page warp, sıralı frame export, Windows Chromium/FFmpeg/FFprobe, teknik verify ve PNG sequence kuruldu.
5. **Galileo içerik:** set, karakter, kitap, tek yönlü sayfa, bilimsel raylar, süreler, çember konstrüksiyonu ve kapanış üretildi. Research/script/storyboard/art direction kalıcı dosyalara yazıldı.
6. **Ses:** Piper yerel çıkarım, altı Türkçe satır, özgün modal score ve efektler. Model kartı ve noncommercial sınırı kaydedildi. Chatterbox/ACE-Step inference yapılmadı; sonraki iyileştirme olarak açık bırakıldı.
7. **Tam taslak:** gerçek 48 saniye/960×540/30 FPS sesli MP4. İlk render final kabul edilmedi.
8. **Denetim:** shot/contact sheet ve el/sayfa, yarış, portal, dönüş temporal şeritleri açılıp incelendi.
9. **Revizyon:** temas, tek yönlü sayfa, geometri/oran, label konumu, warp dikişi, geçiş çizgi devamlılığı ve son kapanış tekrar hareketi giderildi. Önceki tur kareleri korundu.
10. **Teslim:** 1080p/30 FPS/48 s voiced MP4, anlatıcısız score alternatif, kaynak proje, kalite raporu, lisanslar, SHA manifest. Son verify actual final dosyasında başarılı. Kodlanmış final kareleri de açıldı.

Yeni film hazırlığı `npm run new` ile pendulum örneğinde doğrulandı. Bu örnek yalnızca brief-ready; ikinci film yapılmış gibi işaretlenmedi. Yeni sahnelerin yaratıcı üretimi için Codex oturumu gerekir, motor yeniden yazılmaz.

Kalan kalite geliştirmeleri: daha doğal ve açık ticari lisanslı Türkçe anlatım; Chatterbox küçük gerçek benchmark'ı; daha geniş yüz/beden/nesne rig repertuvarı; bağımsız yerel illüstrasyon modeliyle gerçekten farklı hibrit sanat deneyi. Bunlar mevcut teslimde tamamlanmış sayılmaz.
