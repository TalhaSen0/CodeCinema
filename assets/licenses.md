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

## İncelenen ama kullanılmayan modeller

- Chatterbox Multilingual V3: resmi repo ve Hugging Face kartı MIT bildirir; Türkçe desteklenir. PyTorch/torchaudio ve çok GB checkpoint gerekir. Bu teslimde model yüklenmedi, örnek üretildi veya Piper'dan iyi/kötü çıktı iddiası yok.
- ACE-Step 1.5: resmi repo ve proje sayfasında MIT; düşük VRAM çalışma modu var. Bu makinenin 8 GB VRAM'i mutlak bir engel gibi sunulmadı. Özgün kısa programatik score tercih edildi; model kurulmadı/benchmark edilmedi.

Telif/lisans notu kaynakların bu tarihte bildirilen durumudur; genel hukuki uygunluk sertifikası değildir.
