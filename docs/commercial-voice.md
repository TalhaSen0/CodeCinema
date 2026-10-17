# Türkçe ticari anlatım geçişi

## Kullanıcı dinleme sonucu — reddedildi

Kullanıcı 42 saniyelik Freya örneğini dinledi ve sesi belirgin biçimde cızırtılı,
düşük kaliteli buldu. Freya-small mevcut aday olarak kabul edilmedi; finalde
kullanılmayacak. Önceki sayısal kontroller yalnız sessizlik/clipping/süreyi ölçtü;
algısal kaliteyi doğrulamadı. Teknik başarı ses kalitesi onayı değildir.
Kaynak kod karşılaştırmasında 48 kHz decoder çıkışı, float32 çıkarım ve örnekleme
yolu upstream ile uyumlu; MP3/AAC sıkıştırması veya tempo işlemi uygulanmamıştı.
Bu nedenle koddan kanıtlanmış bir örnekleme/sıkıştırma hatası bulunmuş değildir;
cızırtının kesin kök nedeni henüz saptanmadı.

### Alternatif deneme: Chatterbox Multilingual V3

Türkçe destekleyen MIT lisanslı aday için resmi kod incelendi; lisans ve kart
`assets/licenses/chatterbox/` içine kaydedildi. Kaynak SHA
`5de7a54aa4e5e2baadb0182dde554908b48b85c2`, model SHA
`5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`.
`tools/benchmark-chatterbox.py` yalnız gerekli 3,207,041,842 baytlık dosyaları
seçer ve LFS SHA-256 doğrular; V3 seçimi açıkça yapılır (upstream varsayılanı V2).
Başkasının ses kaydı/Piper referansı kullanılmaz; paketle gelen varsayılan ses
koşulları kullanılır. Perth watermark kaldırılmaz.

Bu deneme henüz çalışmadı: paket indirmelerinde timeout, model aktarımında
çok düşük hız gözlendi; indirme işlemleri durduruldu. Yerel V3 WAV'ı henüz yok.
Deney ortamı `.tools/chatterbox-env` ayrı paket katmanıyla Freya ortamını salt
okunur `.pth` yolundan kullanacak şekilde hazırlandı; Freya paketleri değiştirilmedi.
PyTorch 2.9.1 yeniden kullanımı upstream 2.6.0 pininden sapar; bu ortam üretim
için doğrulanmış değildir. Kurulum bitmeden benchmark çalıştırılmamalı.
Kaynak: https://github.com/resemble-ai/chatterbox ve
https://huggingface.co/ResembleAI/chatterbox .

### Resmi demo ile gerçek dinleme örneği

Yerel indirme tamamlanamadığı için resmi Chatterbox Multilingual Space üzerinden
iki Galileo cümlesi gerçekten üretildi. Bunlar yerel GPU ölçümü değildir ve
V3 olarak etiketlenmez: çalışan sunucunun ağırlık sürümü doğrulanmadı.
İncelenen Space kod revizyonu `c612a94210c0af895d6b649850d15b7ccca36594`.
Kaynak: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS .

Çıktı: `films/galileo/assets/auditions/chatterbox-hosted/`. İkinci anlatım satırı
5.16 s, beşinci satır 6.92 s; arada 1 s boşlukla dinleme dosyası 13.08 s.
24 kHz mono WAV, sonlu değerler. Ham dosyalarda birer tam ölçek tepe örneği var;
yalnız PCM tepesinden clipping olduğu/olmadığı kesinleştirilemez. Headroom
kopyasına sadece -6 dB gain uygulandı; filtre, gürültü temizleme veya tempo yok.
Ham sesler korundu. `manifest.json` ve `technical-review.json` ölçümleri içerir.
Kullanıcı bu ham adayı Freya'dan daha iyi buldu ve hafif bozukluğa rağmen
devam edilebilir olarak kabul etti; ticari kullanım uygunluğu şartı devam ediyor.

### Hafif cilalama ve lisans kontrolü

Son kullanıcı incelemesi iki cümle arasında nefes/gıcırtı benzeri istenmeyen
ses bildirdi. Eklenen 5.16–6.16 s boşluğu ham kayıtta zaten sıfırdır; ilk
cümlenin 4.47–4.99 s kuyruğunda ayrı düşük seviyeli aktivite bulundu.
`pause-inspection.png` dalga biçimi ve spektrogramı gerçekten açılıp incelendi.
Sesin nefes mi sentez artığı mı olduğu doğrulanmadı. 4.145083 s geçici konuşma
bitişi seçildi; dinleme ile kelime sonu korunması ayrıca onaylanmalıdır.

`tools/speech-envelope.py` dışarıdan verilen konuşma aralıklarına 100 ms pay
ve 10 ms kosinüs fade uygular; arada sıfır kazanç verir. İkinci cümle tamamen
korundu. `speech-intervals.json` bu örneğin açık/geçici sınırlarını içerir.
`listening-reel-pauses-clean.wav` 13.08 s kalır; tam kazanç bölgeleri PCM16
kaynağıyla birebir aynı, kapatılan bölgeler tam sıfır olarak kontrol edildi.
Bu araç konuşma algılamaz veya metni zamanla hizalamaz. Gelecek üretimde
gerçek kayda hizalanmış/doğrulanmış aralıklarla otomatik uygulanabilir;
yalnız ses yüksekliği eşiğiyle her sessiz heceyi kesmek uygun değildir.
Müzik/efektler yerine yalnız anlatım kanalına uygulanmalıdır. Ticari izin
durumu değişmedi; yeni kayıt hâlâ dinleme adayıdır.

`tools/polish-chatterbox.py` mevcut FFmpeg afftdn filtresiyle 4 dB hafif
gürültü azaltma adayı üretir; sabit -50 dB taban, gain smoothing 6. Yeni model
ve ücretli API yok. Ham ses korunur, süre/hız değiştirilmez. Önce/sonra RMS
eşleştirilir: 0.0592749. Her sürüm 13.08 s / 24 kHz mono; sonlu değerler,
tam ölçek örneği yok. Teknik sonuçlar `polish-review.json` içindedir.
`comparison-original-then-polished.wav`: önce ham 13.08 s, 1 s ara, sonra
işlenmiş 13.08 s. İşlenmiş sesin algısal üstünlüğü henüz doğrulanmadı.
Perth kaldırma işlemi yok; filtre sonrası watermark tespiti ölçülmedi.

Model ve kod MIT; yerel kullanım bir free-tier kotasına veya ücretli API'ye
bağlı değil (donanım/işletim maliyeti ayrı). Demo hizmetinin kalıcı ücretsiz
üretim kapasitesi garanti edilmiyor. Demo referansının konuşmacı/kayıt izni
MIT model lisansından ayrı: resmi tartışma #45 içinde ticari kullanım sorusuna
yayıncı izni bulunamadı. Bu nedenle aday ve cilalı türev henüz ticari final değil.
Ticari teslim için açık izinli/kişinin rızası bulunan referans ve tamamlanmış
yerel kurulum gerekiyor; Piper/Freya referansı kullanılmayacak.

Kaynaklar (16 Ekim 2026):
- https://github.com/resemble-ai/chatterbox/blob/master/LICENSE
- https://huggingface.co/ResembleAI/chatterbox
- https://huggingface.co/ResembleAI/chatterbox/discussions/45
- https://ffmpeg.org/ffmpeg-filters.html#afftdn
- https://ffmpeg.org/legal.html (runtime LGPL/GPL yükümlülükleri; işlenen WAV'a model lisansı eklenmez)

Demo kendi yayımladığı Türkçe referans sesini kullanır. Bu referansın ayrı ticari
hakları doğrulanmadığından **bu dosyalar yalnız dinleme adayıdır, ticari final
değildir**. Sonraki aşama uygun haklara sahip ses kaynağıyla yerel üretimdir.
Freya/Piper sesi referans verilmedi, mevcut filme hiçbir aday eklenmedi.

Yerel indirme aracı 1 MiB parçalarla devam edebilir ve tamamlanmış model dosyasını
resmi LFS SHA-256 ile doğrular. Yaklaşık 183 MiB parça birikti; tam model değildir.
Paket kurulumu hâlâ eksiktir. İşlemler durduruldu, parçalar sonraki deneme için korunur.

İlk denemenin teknik kaydı: FreyaTTS-small. Model/kod Apache-2.0, kullanılan VoxCPM2
AudioVAE2 model kartı Apache-2.0 bildirir. Bunlar ticari kullanıma izin veren yayıncı
lisanslarıdır; eğitim verilerinin tüm sözleşmelerini bağımsız denetlediğimiz veya
sıfır hukuki risk garantisi verdiğimiz anlamına gelmez.

Kaynaklar:
- https://github.com/freyavoiceai/FreyaTTS/blob/main/LICENSE
- https://huggingface.co/freyavoice/Freya-TTS
- https://huggingface.co/openbmb/VoxCPM2
- https://github.com/OpenBMB/VoxCPM

Tam sürümler `assets/commercial-voice-policy.json` içindedir. Başkasının sesini
klonlamıyoruz. Varsayılan seed 9 aynı anlatıcı kimliği için korunur. Freya-large
bu açık modelin parçası değildir ve kullanılmaz.

## İzole kurulum

Mevcut Python/Piper ortamı korunur. Windows PowerShell, repo kökü:

```powershell
git clone https://github.com/freyavoiceai/FreyaTTS.git .tools/freya-source
git -C .tools/freya-source checkout 146d36c1cb6660646be57d31339db4eed9315de3
uv venv --python 3.11 .tools/freya-env
uv pip install --python .tools/freya-env/Scripts/python.exe torch==2.9.1 torchaudio==2.9.1 --index-url https://download.pytorch.org/whl/cu128
uv pip install --python .tools/freya-env/Scripts/python.exe -r requirements-commercial.txt -c requirements-commercial.lock.txt
npm run audio:commercial
```

Kurulum büyük PyTorch runtime'ı içerir. Model indirmesi ayrıca toplam 2 GB ile
sınırlıdır: yalnız Freya config/ağırlık/kart ve VoxCPM2 audiovae/kart dosyaları.
Tüm VoxCPM2 dil modeli veya başka bir ses modeli otomatik indirilmez.
Başarıyla kullanılan gerçek ortam `requirements-commercial.lock.txt` içindedir.
Bu kayıt Windows/Python 3.11/CUDA 12.8 ortamına aittir.

## Üretim ve denetim sözleşmesi

`tools/audio-commercial.py --film galileo` yalnız
`films/galileo/assets/commercial-freya/` içine yazar. Hiçbir Piper WAV'ını veya
cache kaydını kullanmaz. Çıktı manifestinde metin, policy, kaynak ağırlık hash'leri,
seed, süre, peak/RMS, hız ihtiyacı ve gerçek üretim süresi bulunur.

Upstream sessiz çıktı durumunda seed değiştirebiliyor. Adapter bu gizli ses kimliği
değişimini kullanmaz: sabit seed ile tek üretim yapar, sessizlik/clip durumunda durur.
Kod checkpoint yüklemede strict state-dict eşleşmesi kullanır.

Yeni ses adaydır. Önce altı satırın bütün sözcükleri, yabancı özel adları, tarihler,
vurgu, nefes ve tını sürekliliği dinlenir. Slot taşması varsa sessizce kesilmez;
metin/zaman revizyonu veya belgelenmiş sınırlı tempo uyarlaması gerekir.
Sonra yeni mix ve ayrı isimli MP4 üretilip ses kaynağı hash'leri doğrulanır.

## Mevcut dosyaların durumu

Gerçek benchmark tamamlandı: RTX 4060 Laptop üzerinde altı satır üretildi.
İlk sıcak model üretimi toplam 9.64 saniye; aynı seed ile ikinci süreçte yeniden
üretim 10.63 saniye. Bu süreler indirme, import ve model yüklemeyi içermez.
İki üretimde de altı WAV hash'i birebir aynıydı; farklı donanımlarda aynı sonuç
garantisi verilmez. En yüksek PyTorch allocated VRAM yaklaşık 1.46 GiB;
bu ölçüm ekran kartının toplam süreç belleği değildir.

| Satır | Ham ses | Kullanılabilir slot (150 ms payla) | Gerekli hız |
| --- | ---: | ---: | ---: |
| 1 | 7.12 s | 6.95 s | 1.024× |
| 2 | 4.08 s | 5.05 s | 1× |
| 3 | 6.28 s | 7.65 s | 1× |
| 4 | 7.52 s | 7.75 s | 1× |
| 5 | 9.60 s | 7.55 s | 1.272× |
| 6 | 3.12 s | 4.85 s | 1× |

Ham WAV'lar 48 kHz mono PCM16; peak/RMS kontrolleri geçti. Öznel ses kalitesi,
telaffuz ve sözcük eksiltme dinlenerek doğrulanmadı. Özellikle Johann Bernoulli,
sikloid ve beşinci satırın uzaması incelenmeli. Otomatik tempo değişikliği yapılmadı.
`films/galileo/assets/commercial-freya/listening-reel.wav` altı satırı birer saniye
ara ile birleştirir; film zamanına oturtulmuş mix değildir. Metin/süre/hash/üretim
kanıtı aynı dizindeki `manifest.json` içindedir. Sonraki adım dinleme değerlendirmesi,
slot sorununun çözümü ve ayrı bir ticari sesli MP4 teslimidir.

`galileo-final.mp4` ve `galileo-final-v2.mp4` eski Piper anlatımını içerir ve
ticari olmayan kullanım sınırı devam eder. Yeni kod eklemek eski MP4'ün haklarını
değiştirmez. Yeni ticari sesli final üretilip doğrulanmadan bu dosyalar ticari
teslim olarak etiketlenmez. Model lisans bildirimleriyle runtime lisansları ayrı tutulur.
