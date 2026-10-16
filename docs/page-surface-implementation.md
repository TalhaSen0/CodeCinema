# Galileo — uygulama ve teslim raporu

16 Ekim 2026. Baseline: Git `cc2b213`, çalışma dalı `fix/page-surface`. Önceki film `renders/galileo-before-pages.mp4` olarak da korundu. Yeni teslim `renders/galileo-final-v2.mp4`; `galileo-final.mp4` aynı yeni dosyanın güncel adı. Karşılaştırma `renders/galileo-before-after.mp4`.

## Yapılan değişiklikler ve kök nedenler

### Ortak sayfa sahipliği

Yeni `engine/page-surface.mjs`, `PageSurface` sınıfının `world()`, `view()`, `sample()`, `mesh()` ve `boundary()` fonksiyonlarını içeriyor. Sayfanın yerel UV alanı, onaylı Bézier sınırları, kitap konumu ve projektif matrisi tek nesnede tutuluyor. Genel scene graph veya yeni framework eklenmedi; Canvas 2D, seek(t), Chromium ve FFmpeg korundu.

`films/galileo/pages.mjs` içindeki `BOOK_ORIGIN`, `RIGHT_PAGE`, `LEFT_PAGE`, `pageSurface`, `leftSurface` hem fiziksel kitabın hem geçişlerin geometrik kaynağı. `room.mjs:book()` artık bu kontrolleri kullanıyor. Bağımsız portal köşe listesi ve ayrı küçük A/B diyagramı kaldırıldı.

`films/galileo/page-content.mjs:renderPageContent()` ve `pageTexture()` tek mantıksal folio içeriğini oluşturuyor: parşömen, başlıklar, çizgiler, bilimsel animasyon, kronometre, legend ve bölüm metni birlikte rasterize ediliyor. `notes`, `galileo`, `bernoulli`, `back` farklı sayfa kimlikleri. Kitaptaki bilim çizimi tam ekran içeriğin aynı UV dokusu; ayrı bir yeniden çizim tarifi yok. Küçük/eğik kitap görünümünde aynı dokunun iki eksende ön filtrelenmiş örnekleri kullanılıyor; bu, küçük harflerdeki noktalı aliasing'i azaltıyor.

### Perspektif, giriş ve dönüş

`engine/warp.mjs` artık `homography()`, `inverse3()`, `multiply3()` ve perspektif bölmesi yapan `project()` içeriyor. `warp()` uyumlu girişini koruyor fakat bilinear dörtgen yerine projektif düzlem örnekliyor. `regularMesh()` ve `drawMesh()` aynı altyapıyı bükülen sayfada da kullanıyor. Üçgen raster dikişleri kenar normalinden küçük örtüşme payıyla giderildi; fiziksel sayfa sınırı ayrıca clip ediliyor.

`PageSurface.view()` kitap düzlemi ile tam ekran düzlemini tek homojen matris üzerinden bağlar. Oda kamerası da bu düzlemden ve ters kitap matrisinden türetilir. `film.mjs:portal()` bu kamerayı odaya uygular; bağımsız büyüyen bir kart yok. Kitabın onaylı eğriliği yaklaşırken sürekli olarak düzleşir.

`pageStateAt()` kitap/giriş/tam ekran/dönüş boyunca aynı içerik kimliğini korur. Girişte başlangıç foliosu t=14 durumunda tutulur ve 14'ten sonra aynı animasyon devam eder. Dönüşte Bernoulli foliosu t=41 durumunda tutulur ve 44'ten sonra kitapta yaşamaya devam eder. Başka bir küçük çizime geçiş yapılmaz.

`roomBase()` / `roomForeground()` sayfa ile el, kalem, mürekkep şişesi ve kitap yığınlarının örtüşme sırasını ayırıyor. Ön planın yaklaşma yüksekliği, dönüşen oda sınırından türetiliyor; tam ekran sınırında görünür el/kalem kalmıyor. Mum ışığının screen bileşimi oda katmanında korunuyor; saydam ön plan texture'ına yanlış kompozitlenmesiyle oluşan parlaklık sıçraması giderildi.

### Fiziksel sayfa çevirme

`curlPoint()` hareketli ve hafif çapraz bir katlama hattı etrafında silindirik yüzey üretir; UV koordinatları malzemeye bağlı kalır. Ön yüz normaline göre eski basılı sayfa, arka yüz için aynı kâğıt dokusu seçilir. `drawMesh()` yüzeyleri derinliğe göre sıralar. Alt sayfa önce, kıvrılan ön/arka yüz sonra çizilir; sayfa dönüşü `ease()` ile hızlanıp yavaşlar. Ekranı açan dikdörtgen wipe ve bağımsız 1696 overlay'i kaldırıldı.

1696 ve Johann Bernoulli metinleri yeni `bernoulli` sayfasının dokusundadır. Eski sayfanın örttüğü yerde görünemez. Bu görünürlük hem gerçek karelerde hem ayrı renkli sayfa tanılama modunda kontrol edildi.

İlk yerel inceleme sırasında eski homografinin kitap dışındaki uzantısı sayfayı aşırı büyütüyordu. Dönen sayfanın sonu gerçek `LEFT_PAGE` sınırına bağlandı; artık dönüş boyunca kitap bölgesi içinde kalıyor ve arka yüz sol sayfada sürüyor. Bu hata için ayrıca tüm hareketi tarayan sınır testi eklendi.

### Anatomi ve temas

Yeni `engine/rigging.mjs:solveArm()` eşit tasarım uzunlukları (135/130), 52–165° dirsek açısı ve sabit dış dirsek yönü kullanıyor. Erişilemeyen hedeflerde kemik uzatmak yerine bilek hedefi erişim alanına yansıtılıyor. Galileo hareketinde bu sınıra çarpan poz bulunmadı.

`films/galileo/motion.mjs:characterPose()`, `rightGoal()` ve `contactAt()` omuz/dirsek/bilek ile sayfa temasını ortak pozdan üretir. Parmak, 4.7–5.2 s kavrama sırasında kıvrılan sayfanın UV=(.96,.60) noktasını izler; ardından el bırakır, sayfa hareketini tamamlar. Böylece karakterin gövdesini keserek bütün dönüşü takip etmesi gerekmez.

`character.mjs:sleeve()` kalın, keskin zikzak çizgi yerine iki bağlantılı, daralan kol parçası çizer; omuz kaplaması bağlantı boşluğunu kapatır. `drawHands()` elleri bir kez, kitap üstünde çizer. Kalem aynı bilek transformunun child'ıdır. `head()`, `torso()` ve `hand()` tasarım fonksiyonları değiştirilmedi. Bu, stilize bir 2D kukla rig'idir; tam anatomik/3D insan simülasyonu değildir.

### Sınırlı ritim iyileştirmesi

İlk yarış yaklaşık 20.32 s'de bitiyor; gerçek ses satırı 20.987 s'de bitiyor. 20.4–22.7 s arasında sağdaki boş alanda “Dairesel yay: daha uzun yol, daha kısa süre.” sonucu mürekkeple beliriyor ve altı çiziliyor. Ardından 24 s'ye kadar bilinçli okuma duraklaması var. Not sayfa dokusunun parçası; dönüşte o da kâğıtla hareket ediyor. Kamera sallama veya yeni rastgele parçacık eklenmedi. İkinci bölümün sonuç cümlesi artık parşömeni düz renk dikdörtgenle kapatmıyor.

## Gerçekten yapılan doğrulamalar

- **13 birim testi geçti.** Yeni `tests/page-surface.test.mjs`: projektif ters dönüşüm, doğru çizgi perspektifi, kitap köşeleri, içerik referans noktaları, sürekli/sonlu ön-arka yüz, başka kitap pozu ve 301 adım boyunca ilk dönüşün boyut sınırları. Yeni `tests/rig.test.mjs`: 1.441 pozda iki kolun kemik uzunlukları, açıları, dış/aşağı dirsek yönü, bilek açısı ve ani çözüm sıçraması; 120 Hz kavrama teması; erişilemeyen hedef. Mevcut dört fizik testi korundu.
- **Gerçek raster yüzey testi:** `tools/verify-surfaces.mjs`, 17 zamanda A/B için 34 renkli referansın piksel merkezini ölçüyor. En büyük hata **0.534 px**, tolerans 3 px. Önceki 14/37 px farkları ayrı çizimler arasında oluşuyordu; artık aynı UV'nin gerçek çizimi ölçülüyor. Ayrıca mürekkep şişesi ön planı ve yeni bölümün açılmadan görünmemesi kontrol ediliyor.
- **Dokuz geçiş sınırı:** 4.7, 6.9, 10, 14, 24, 28.5, 29, 41, 44 s'nin ±0.0001 s görüntüleri karşılaştırıldı. Sayfa tam ekran sınırlarındaki ortalama RGB farkı yaklaşık 0.006/255. Tüm sınırlar 1/255 ortalama ve %0.5 büyük değişim toleransını geçti. Bu dar sınır testi bütün hareket için yeterli sayılmadı.
- **Yoğun temporal kareler:** `tools/review-transitions.mjs` 3.7–7.3, 9.5–14.5, 23.5–29.5 ve 40.5–44.5 s aralıklarında 12 Hz, kritik sınırların çevresinde ek 30 FPS kareleri üretir: 63+73+91+61 = **288 kare**, 19 sayfalık şerit ve 44 büyük anahtar kare. `review/revision/` altında saklandı. El, giriş, bütün bölüm dönüşü ve çıkış şeritleri görüntü aracıyla açılıp incelendi; omuz boşluğu, yüzey tekilliği, ön plan sıçraması, raster dikişleri ve notun diyagramla çakışması bu incelemelerde bulunup giderildi.
- **Tam renderdan önce dört yerel MP4:** `tools/render-transition-tests.mjs` 30 FPS 108/150/180/120 karelik klipleri üretti. `tools/verify-transition-clips.py` bütün klipleri decode etti, süre/kare sayısını ve ardışık farkı kontrol etti; 6 Hz kodlanmış şeritler de açıldı. En büyük düşük çözünürlüklü ortalama kare farkı yaklaşık 7.04/255; eşik 25. Yerel geçiş kontrolleri geçmeden tam film render edilmedi.
- **Stil referansı:** `tools/capture-baseline.mjs` baseline commit kaynaklarını sadece inceleme dizinine çıkarıp aynı Chromium'da 2 s karesini üretti. `tools/verify-style.py` yüz, kitaplık ve pencere ROI'lerini karşılaştırdı. RGB RMSE sırasıyla **0.013, 0.004, 0.023/255**. Yüz/gövde/el/oda çizim fonksiyonlarının ve `paint.mjs`, `physics.mjs` kaynaklarının değişmediği ayrıca doğrulandı. Kollar ve sayfa kasıtlı değiştiği için bu ROI'lere dahil edilmedi. Eski H.264 kareleriyle farkın bir bölümü kodlama/örnekleme farkı olduğundan kaynak koruma ölçümü kayıpsız tarayıcı referansına karşı yapıldı.
- **Ses:** mix/narration/score ve altı voice WAV'ın SHA-256 değerleri baseline ile aynı. Ses yeniden üretilmedi. Eski ve yeni MP4 sesinin decode edilmiş PCM SHA-256 değerleri de birebir eşleşti (`encoded-audio-verification.json`). Kodlanmış finalde senkron, süre, peak ve decode kontrolü yapıldı. Yeni öznel ses kalitesi dinleme değerlendirmesi yapıldığı iddia edilmiyor.
- **Tam film:** 960×540 taslak ve 1920×1080 final render edildi. `npm run verify` 13 testi, finalin 15 teknik kontrolünü ve yüzey kontrolünü çalıştırıyor: 48 s, 30 FPS, 1.440 kare, H.264/AAC, BT.709 limited/yuv420p, eksiksiz decode, boş kare yok, beklenmedik sıçrama yok, 19 zamanda tekrar/araya başka zaman sokulan seek determinism'i, browser hatası yok, 192 örnekte taşma yok, ses slotları/olayları/peak ve bilimsel süre sırası doğru.
- **Kodlanmış final görsel incelemesi:** `tools/review-encoded.py` gerçek MP4'ten 31 anahtar kare ve el/yarış/giriş/**sayfa dönüşü**/çıkış için 12 Hz şeritler çıkarıyor. Contact sheet, önce/sonra 2/12/26/43 s karşılaştırması, özellikle 24.83–27.42 s dönüş, 12.17–13.42 s giriş, 40.5–41.75 s çıkış ve 5.03–6.28 s el şeritleri açıldı; tam boy kapanış karesi de incelendi. Önceki denetimde eksik olan 24–29 s aralığı artık varsayılan araçlarda var. İnceleme kare dizileri üzerinden yapıldı; kesintisiz gerçek zamanlı insan izleyici değerlendirmesi olarak sunulmuyor.

Makine kanıtları: `review/verification.json`, `review/revision/surface-verification.json`, `style-verification.json`, `clips/verification.json`, aralık başına `manifest.json` ve `encoded/manifest.json`. Önceki raporlar baseline tarihçesi olarak korundu; eski başarılı kontrollerin yeni sorunları yakaladığı iddia edilmiyor.

## Değişen dosyalar

Motor: `engine/warp.mjs`, yeni `engine/page-surface.mjs`, `engine/rigging.mjs`.

Film: `film.mjs`, `room.mjs`, `character.mjs`, `motion.mjs`, `production.mjs`; yeni `pages.mjs`, `page-content.mjs` (`films/galileo/` altında). Ses asset'leri ve HTML/framework bağımlılıkları değişmedi.

Denetim: yeni iki test dosyası; `tools/review-transitions.mjs`, `transition-sheets.py`, `verify-surfaces.mjs`, `render-transition-tests.mjs`, `verify-transition-clips.py`, `capture-baseline.mjs`, `verify-style.py`, `compare-revision.py`. `verify.mjs` ayrı çıktı raporu yolunu destekleyecek şekilde güncellendi. Mevcut `capture.mjs` ve `review-encoded.py` eksik dönüş aralığı ve yoğun/paginated örnekleme için güncellendi. `package.json` verify komutu yüzey kontrolünü de kapsıyor. README, AGENTS, ilerleme ve bu rapor güncellendi.

## Kalan sınırlar ve tekrar kullanım

PageSurface aynı 1920×1080 içerik sözleşmesinde farklı dokular ve kitap pozlarıyla kullanılabilir; ikinci kitap pozu testi geçti. Yeni film `PageSurface` + sınır kontrolleri + `pageTexture(contentId,time)` + zaman aralıkları sağlar. Kimlik/UV/yüzey/mapping mekanikleri yeniden yazılmaz; film özelindeki içerik, poz ve kamera kalibrasyonu değiştirilir.

Oda perspektifi hâlâ onaylı 2D illüstrasyonun **kalibre edilmiş 2.5D projeksiyonudur**. Ön plan yüksekliği yaklaşık; gerçek 3D oda, çok yapraklı kalınlık/çarpışma simülasyonu ve keyfi kamera orbit'i yok. Curl analitik bir yüzeydir; kağıt fiziği çözücüsü değildir. Çok eğik veya farklı formatlı yeni kitaplarda kalibrasyon, görünürlük ve boyut testleri yeniden çalıştırılmalıdır. Mipmap küçük harf titreşimini azaltır; geniş planda minik kitap metnini okunur büyüklüğe dönüştürmez.

Dar sayfa kenarlarında üçgen örnekleme/antialias farkı kalabilir; bunları sıfır fiziksel hata diye nitelemiyorum. Mevcut çıktıdaki ölçülen eşleşme tolerans içinde. Otomatik görüntü farkı ve açı sınırları sanatsal kaliteyi garanti etmez; sonraki filmlerde yoğun temporal görsel inceleme üretim kapısı olarak korunmalı. Yeni motor gerektiren bir yetersizlik bu çalışma sırasında ortaya çıkmadı.
