# Kaynaklar ve kullanım hakları

## Bu projede üretilen içerik

Galileo karakteri, çalışma odası, kitap, diyagram çizimleri, bitmap deney katmanları, parşömen dokusu, animasyon ve programatik müzik/efektler bu oturumda özgün kodla üretildi. Dış fotoğraf, stok müzik, ücretli görsel API veya ses klonu kullanılmadı. CC0 kayıt indirilmedi; ses efektleri özgün gürültü/oscillator sentezidir.

## Üçüncü taraf kod

- Opus JS Animations — MIT © 2026 klsoen. Render/lib/verify türevlerinde tools/upstream/LICENSE korunur. SHA ve adaptasyonlar docs/source-audit.md içindedir.
- JavaScript Animation Skills — MIT © 2026 iart.ai. Karakter ve kalite ilkeleri referans alındı; lisans vendor/javascript-animation-skills/LICENSE içinde.
- Motion Skills — MIT © 2026 iart.ai; inceleme kaynağı. Bash araçları bu filmde çalıştırılmadı.
- Generative Illustration Skills — incelenen checkout'ta LICENSE yok. Ürün kodu/asset'i alınmadı; inceleme kopyası vendor/ altında.
- Playwright — Apache-2.0; Chromium kendi çoklu açık kaynak lisanslarıyla dağıtılır.
- ffprobe-static — paket MIT; içindeki FFmpeg/FFprobe binary'lerinin ilgili LGPL/GPL koşulları ayrıca geçerlidir.
- imageio-ffmpeg — BSD-2-Clause paket; libx264 içeren FFmpeg executable dağıtım lisansı GPL bileşenlerini içerir. Bu araçlar yerel çalıştırılır. Binary yeniden dağıtımında kendi kaynak/lisans yükümlülüklerini koruyun.
- Piper 1.8 — GPL-3.0 runtime, espeak-ng phonemizer; bağımsız Python sürecinde kullanılır. Runtime lisansı model veri haklarını kaldırmaz.

## Türkçe anlatım — kısıtlı model

Model: rhasspy/piper-voices, tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx. Model kartı yerel assets/models/MODEL_CARD içine indirildi.

Model kartı veri kümesini https://github.com/marytts/dfki-ot-data/ olarak belirtir ve **CC BY-NC-SA 4.0** bağlantısı verir: https://creativecommons.org/licenses/by-nc-sa/4.0/ . İngilizce lessac medium sesinden fine-tune edildiği de belirtilir. Model ağırlıklarının kapsamlı ticari hak temizliği yapıldığı iddia edilmiyor.

Atıf: DFKI Turkish MaryTTS dataset contributors; Piper voice training/distribution by rhasspy/Piper contributors. Üretilen anlatım üzerinde tempo uyarlaması, örnekleme dönüşümü, miks ve baş/son fade yapıldı. Kısıtın ihtiyatlı yorumu olarak bu modelle üretilen anlatım ve sesli film **ticari olmayan kullanım** için teslim edilir; anlatım türevlerini CC BY-NC-SA 4.0 koşullarıyla paylaşın. Özgün görüntü/müzik bu modelden türetilmemiştir. Ticari yayın için açık izin ya da uygun lisanslı alternatif ses gerekir.

## Yeni ticari ses adayı — FreyaTTS-small

16 Ekim 2026: Freya kodu ve Türkçe model kartı Apache-2.0; kullanılan VoxCPM2
AudioVAE ağırlık kartı ve VoxCPM 2.0.3 runtime'ı Apache-2.0 bildirir. Freya ve
VoxCPM runtime lisans metinleri ile model kartları `assets/licenses/freya/` içinde
ayrı saklandı. Sabit commit'ler `assets/commercial-voice-policy.json` içinde.
Kaynaklar: https://github.com/freyavoiceai/FreyaTTS ve
https://huggingface.co/freyavoice/Freya-TTS ile https://huggingface.co/openbmb/VoxCPM2 .

Altı Türkçe WAV gerçekten üretildi; hiçbir Piper WAV/mix veya kişi ses klonu
kullanılmadı. Yayıncı lisansları ticari kullanıma izin verir; bu kayıt eğitim
verilerinin tüm haklarının bağımsız denetimi veya sıfır risk garantisi değildir.
Bağımlılık ortamı `requirements-commercial.lock.txt` içinde; runtime dağıtım
yükümlülükleri model haklarından ayrıdır. Çıktılar adaydır; eski Piper sesli
MP4'lerin noncommercial sınırı devam eder. Dinleme ve slot incelemesi bekleniyor.

## İncelenen ama kullanılmayan diğer modeller

- Chatterbox: resmi kod ve Hugging Face model kartı MIT bildirir; Türkçe desteklenir. Yerel V3 kurulumu eksik. Resmi hosted demo ile iki cümle üretildi, kullanıcı sesi aday olarak kabul etti. Demodaki Türkçe referans kaydının ayrı ticari izni doğrulanmadı; bu örnek ve FFmpeg ile cilalanmış türevi henüz ticari final değildir. Kanıt ve kaynaklar docs/commercial-voice.md içinde. FFmpeg afftdn mevcut yerel runtime ile çalışır; ek model lisansı/ücretli API yok.
- ACE-Step 1.5: resmi repo ve proje sayfasında MIT; düşük VRAM çalışma modu var. Bu makinenin 8 GB VRAM'i mutlak bir engel gibi sunulmadı. Özgün kısa programatik score tercih edildi; model kurulmadı/benchmark edilmedi.

Telif/lisans notu kaynakların bu tarihte bildirilen durumudur; genel hukuki uygunluk sertifikası değildir.

## Alania sentetik referans sesleri

`assets/voice-references/alania/`: voices yapılandırması CC BY 4.0, PatientDesk AI. Yayıncı gerçek kişi sesi bulunmadığını ve ticari kullanım/uyarlamaya izin verdiğini bildirir. İki referans seçildi; d1-02552 ile yeni Chatterbox örneği üretildi. Dağıtımda atıf, lisans bağlantısı ve yapılan değişiklik bildirimi gerekir. Revizyon, hash, kaynak ve hazır atıf: docs/male-voice-selection.md. Eski Piper MP4 lisansı değişmez.
