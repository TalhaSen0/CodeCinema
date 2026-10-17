# Tok erkek anlatıcı seçimi

Kullanıcı tok erkek sesi istedi. Alania Turkish Synthetic Speech `voices`
yapılandırması incelendi. Yayıncı tüm referansların VoxCPM2 ile yazılı
tariflerden tasarlandığını, gerçek kişilerin seslerinin bulunmadığını ve
atıfla ticari kullanım/uyarlamaya izin verildiğini açıkça bildiriyor.

Kaynak: https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr
Revizyon: `277dfc8a2322014099ff72688bcaee12480c4605`.
Lisans: **CC BY 4.0** (`voices`; Wikipedia içeren CC BY-SA kısmı kullanılmadı).
Kaynak README, LICENSE ve referans hash'leri `assets/voice-references/alania/`
içinde saklandı. Dataset viewer ses URL'leri aynı revizyonu içeriyor.
Yayıncı lisansına dayanılıyor; bağımsız tüm hak zinciri denetimi iddiası yok.

Seçilen sentetik referanslar:
- `d1-02552`: yayıncı tarifi tok, sıcak, sakin, anlatıcı üslubunda erkek.
- `d1-02275`: yayıncı tarifi kalın, yumuşak, kadifemsi, yavaş erkek.

İlk referansla Chatterbox resmi demosunda gerçekten üretilen cümle:
“Aynı iki nokta arasında, düz bir rampa en kısa mesafeyi sunar.”
Çıktı 6.48 s / 24 kHz mono. Bu, referans kaydının oynatılması değil yeni metnin
Chatterbox üretimidir. Yüklenen model sürümü doğrulanmadı; yerel V3 ölçümü değil.
Hafif afftdn + metin hizalaması + 100 ms pay / 10 ms fade uygulandı; ses
kalınlaştırma ve tempo değiştirme yapılmadı. Son tepe 0.50073; sonlu değerler.
Öznel tok/doğal ses kalitesi kullanıcı dinlemesi bekliyor.

İkinci cümle isteği resmi demo tarafından ZeroGPU kotası dolduğu için reddedildi.
Başka hesap/endpoint ile kota aşılmaya çalışılmadı. İkinci anlatıcıyla henüz
sentez yapılmadı. Araç mevcut kaynak/text/hash eşleşen tamamlanmış cue'ları
koruyarak devam edebilir: `tools/audition-male-voices.py`.
`tools/prepare-male-auditions.py` yalnız gerçekten üretilmiş cue'ları hazırlar.
Yerel Chatterbox kurulumu hâlâ tamamlanmadı; yerel üretimin servis kotası yoktur.

Dinleme dosyası:
`films/galileo/assets/auditions/male-voices/d1-02552/listening-ready.wav`.
Ham ses, ayarlar, kaynak kimliği ve hash manifest.json; işlem kanıtı review.json.
Önceki demo sesi ve Galileo finali değiştirilmedi. Yeni ses ticari izin temeli
bulunan adaydır; tam film üretimi/kalite onayı tamamlanmış değildir.

Dağıtıma eklenecek atıf:

> Alania Turkish Synthetic Speech by PatientDesk AI
> (https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr),
> CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
> Synthetic reference used for new AI-generated Chatterbox narration;
> audio denoised and pauses gated.

Diğer araştırma: Open Swara genel ticari kullanım iddiasına rağmen atıf listesi
noncommercial MMS ve Piper runtime lisansını model lisansı gibi gösteren
kayıtlar içeriyor. Bu nedenle toplu lisans etiketine dayanarak referans alınmadı.
Kaynak: https://huggingface.co/datasets/jaymunshi/open-swara/blob/main/ATTRIBUTION.md .

## Kullanıcı onayı ve kalıcı seçim

Kullanıcı: “ses çok iyi bunu kilitleyelim.” Seçilen ses **d1-02552**.
`assets/selected-voice.json` kilit dosyasına işaret eder. Korunan referans,
onaylı örnek ve ham örnek `assets/voices/codecinema-narrator/` içindedir.
SHA-256, seed, üretim ve temizlik ayarları voice-lock.json içinde tutulur.
Üretim komutu yalnız bu sesi kullanır; başka anlatıcıya sessiz geçiş yoktur.
Aynı seed/referans farklı model sürümlerinde birebir ses garantisi vermez;
yeni üretimler onaylı örnekle karşılaştırılmalıdır. Tam film henüz üretilmedi.
