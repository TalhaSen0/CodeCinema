# Türkçe konuşma sınırı deneyi

Kullanıcı `listening-reel-pauses-clean.wav` dosyasını dinleyerek kelime sonunda
bozulma olmadığını ve aranın temiz olduğunu onayladı. Bu onay o dosyaya aittir;
yeni otomatik adayın onayı değildir. SHA ve onay `listening-review.json` içinde.

## Yerel çalıştırma

`.tools/alignment-env/Scripts/python.exe tools/align-narration.py`

İzole ortam: stable-ts 2.19.1, openai-whisper 20250625; mevcut Freya ortamındaki
torch/numpy/scipy/soundfile salt okunur .pth ile yeniden kullanılır. Önceki
paketler değiştirilmedi. Yeni model yalnız Whisper tiny (yaklaşık 72 MiB).
Model indirmesi çalışma komutunda örtük değildir; dosya önceden bulunmalıdır.
SHA-256: `65147644a518d12f04e32d6f3b26facc3f8dd46e5390956a9424a650c0ce22b9`.
Araç her çalışmada bu hash'i ve kaynak seslerin manifest hash'lerini doğrular.
CPU üzerinde çalışır; ücretli API veya konuşma verisi yükleme yoktur.

Model ve Whisper kodu MIT, stable-ts MIT; lisanslar
`assets/licenses/alignment/` altında. Stable-ts deposu arşivlenmiş durumda;
bu yüzden sürüm sabitli ve henüz deneysel adaptör olarak tutuluyor.
Kaynaklar: https://github.com/openai/whisper#license ve
https://github.com/jianfch/stable-ts .

## Sonuç ve sınır

Gerçek iki Türkçe cue üzerinde metin verilerek forced alignment çalıştırıldı.
Bu işlem metnin gerçekten söylendiğini bağımsız ASR ile doğrulamaz.

- Cue 1: 11 kelime; son kelime 3.86–4.06 s. Onaylı elle seçilen bitiş
  4.145083 s; model yaklaşık 85 ms erken. Modele 100 ms belirsizlik payı
  eklenir: 4.16 s; ayrıca kullanıcı ayarı olan 100 ms koruma ve 10 ms fade
  uygulanır. İstenmeyen 4.47–4.99 s kuyruk tamamen sıfırlanır.
- Cue 4: “bir” kelimesi sıfır süreli, başlangıç kelimesinin token olasılığı
  düşük. Denetim tüm cue'yu korudu. Yanlış kesme uygulanmadı.
- Kayıp metin, sıfır/negatif/taşan süre, monoton olmayan zaman ve düşük token
  olasılığı kontrol edilir. 0.15 olasılık eşiği deneysel bir sezgiseldir;
  kalibre edilmiş doğruluk skoru değildir.
- Yalnız cue başı/sonu kapatılır; iç konuşma durakları ve sessiz heceler
  kelime kelime gate edilmez. Müzik/efekt kanalı bu işlemin dışında kalır.

`listening-reel-auto-pauses.wav` ayrı 13.08 s adaydır. Tam kazanç bölgeleri
PCM16 kaynakla birebir aynı, kapatılmış bölgeler sıfır, ikinci cue tamamen
korunmuş olarak kontrol edildi. Önceden onaylı dosya değiştirilmedi.
Otomatik aday henüz insan dinleme onayı almadı; iki cue genel Türkçe doğruluğu
kanıtlamaz. Test: `.tools/alignment-env/Scripts/python.exe -m unittest discover -s tests -p test_speech_alignment.py`.

## Ticari referans sesi

Chatterbox modelinin MIT lisansı ile demo referans kaydının/konuşmacının izni
ayrıdır. https://huggingface.co/ResembleAI/chatterbox/discussions/45 yeniden
incelendi; yayıncı ticari izin yanıtı hâlâ bulunamadı. Hiç kimseye mesaj
gönderilmedi. Devam için ticari sentetik ses üretimini kapsayan açık izinli
referans veya kullanıcının kendi/izin aldığı anlatıcının kaydı gerekir.
MIT modeli indirmek bu özel demo sesinin haklarını kendiliğinden çözmez.
Mevcut Galileo finali değiştirilmedi; ticari final etiketi verilmedi.
