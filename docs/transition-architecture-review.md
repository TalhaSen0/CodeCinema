# Galileo — geçiş, sayfa yüzeyi ve kol rig'i mimari incelemesi

Tarih: 16 Ekim 2026. Kapsam: salt okunur kaynak/çıktı incelemesi ve çözüm tasarımı. Bu rapor dışında uygulama, araç, asset veya video dosyası değiştirilmedi. Yeni render alınmadı; mevcut kodlanmış final kareleri açıldı. Teslim manifestindeki 43 girdinin hash'i eşleşiyor; final MP4 de teslim hash'iyle aynı.

## Sonuç

Kök problem Canvas 2D'nin kapasitesi değil; kitap, sayfa içeriği, geçiş geometrisi ve el pozunun ortak bir yüzey/koordinat sözleşmesine sahip olmaması. Mevcut altyapının yetersiz olduğu kanıtlanmadı. Yeni motor, framework, genel scene graph dönüşümü veya büyük refactor önermiyorum.

Korunacaklar: onaylanan head()/torso() karakter tasarımı, oda çizimleri, palet, materyaller, hatch, parşömen, font, mevcut bilimsel geometri/fizik, seek(t), Chromium/FFmpeg renderer ve ses. Değişmesi gereken bölüm sayfa sahipliği/projeksiyonu, kol poz çözümü ve bunları doğrulayan kontrollerdir.

## 1. Mevcut çizim ve parent transform ilişkileri

Motor retained bir scene graph kullanmıyor. `seek()` her karede Canvas'a sıralı fonksiyon çağrılarıyla yeniden çiziyor. Aynı canvas'a çizilmek ortak parent transform altında olmak anlamına gelmiyor.

- `films/galileo/film.mjs:82`, `seek()`: zaman aralıklarına göre `wide`, `portal`, `diagram`, `pageTurn` seçer. Bunlar aynı fiziksel sayfanın farklı görünümleri olarak modellenmemiş.
- `film.mjs:55`, `wide()`: Canvas translate/scale bloğu içinde `room()` çizer; oda, karakter, masa ve kitap bu geçici kamera transformunu paylaşır. Sol başlık ve ışık katmanı bu bloktan sonra ekran koordinatlarında çizilir.
- `films/galileo/room.mjs:31`, `book()`: kitabı yerel `(1025,847)` ötelemesi altında çizer. Sayfa sınırları Bézier path'leridir. Küçük mürekkep diyagramı ise ayrıca `ctx.transform(.62,-.06,.25,.19,48,-20)` ile çizilir; tam ekran diyagramın küçültülmüş hâli değildir.
- `room.mjs:40`: küçük çizim iki ayrı path ve A/B harfidir. Tam ekrandaki üç gerçek ray, kronometre, başlık ve legend ile ortak bir içerik kaynağı yoktur.
- `room.mjs:42`: 4.7–7.1 s sayfa çevirme, ayrı dolgu path'idir. Bu path'in üzerinde içerik texture'ı yok; alttaki mürekkep onunla deforme olmaz.
- `film.mjs:64`, `pageTexture`: 1920×1080 offscreen canvas. `portal()` içinde `diagram()`ın başlık, diyagram, legend ve parşömeni burada birlikte rasterize edilir. Dolayısıyla portal sırasında bu öğeler kendi aralarında birlikte warp edilir. Ancak bu texture kitabın `book()` sayfasının child'ı değildir.
- `film.mjs:73`, `pageTurn()`: eski/yeni diyagram ana canvas'a ayrı çizilir; yeni çizim bir clip mask altında, eski çizim sabit kalır. 1696 metni bu clip'in dışındadır.
- `film.mjs:81–87`: altyazılar ve üst film kimliği ekran katmanlarıdır. Bunların sayfayla hareket etmemesi doğrudur; bilimsel sayfa başlıkları ve 1696 bölüm metniyle ayrılmaları gerekir.

Sonuç: kısmi transform grupları var; ortak Book → PageSurface → Content sahipliği yok. Bütün filmi scene graph'a çevirmek gerekli değildir; yalnızca kitap/sayfa alt sistemine açık sahiplik ve transform zinciri eklemek yeterli olabilir.

## 2. Sayfa çevirme gerçek bir yüzey dönüşümü mü?

### 24–29 s: wipe ve dekoratif kıvrım

`pageTurn()` şu sırayı uygular:

1. `diagram(t<26 ? 23.9 : 29, false)` ile eski folioyu sabit çizer.
2. `p=ease(t,24,28.5)`, `edge=1920*(1-p)` hesaplar.
3. `ctx.rect(edge,0,1920-edge,1080)` clip'i altında `diagram(29,true)` çizer.
4. Dikey bir Bézier şeridi ve gradient ile kıvrım görüntüsü ekler.
5. `1696`, `JOHANN BERNOULLI` ve açıklamayı `(960,463/528/589)` ekran konumlarına çizer; sadece alpha değişir.

Eski sayfa döndürülmez/deforme edilmez. Eski harfler katlanan kâğıdın UV koordinatlarında bulunmaz. Yeni sayfanın başlığı sağ tarafta açılırken eski başlığın sol kısmı görünür kalabilir. 1696 ekran katmanı olduğundan, yeni sayfa henüz o noktayı açmadan eski diyagramın üstünde belirebilir. Kodlanmış 25.5 s (`encoded-16.png`) ve 27 s (`encoded-17.png`) kareleri bunu doğrudan gösteriyor.

Bu bir yüzey simülasyonu değil, wipe/overlay kompozitidir. Opacity veya süreyi değiştirmek içerik sahipliğini düzeltmez.

### 4.7–7.1 s: içeriksiz kâğıt silüeti

`motion.mjs`, `pageState()` ile edge/lift üretir; `book()` bunu dolgu path'ine uygular. Ön/arka yüz texture'ı, UV mapping veya alttaki çizimin aynı yüzeye bağlanması yoktur. İki sayfa çevirme tarifi aynı soyutlamayı dahi kullanmıyor.

## 3. 10–14 s giriş ve 41–44 s dönüş nasıl hesaplanıyor?

`portal()` (`film.mjs:65`) ham kitap dörtgenini elle tanımlar:

`[(1017,818), (1302,813), (1307,861), (1031,887)]`.

Bu köşeler `book()`ın path'inden veya ortak bir page surface nesnesinden alınmaz. Önce kamera merkezine göre `screen = (960,530) + zoom × (point − (960,530))` uygulanır. Sonra her köşe tam ekran köşesine ayrı ayrı `mix(pageCorner, screenCorner, k)` ile yürütülür.

Girişte `k=ease(t,10,14)`. Oda zoom'u yalnızca `1.02+t*.006`: 10–14 s arasında 1.080'den 1.104'e çıkar. Sayfa ise bağımsız olarak tam ekran boyutuna açılır. Bu, aynı fiziksel kameranın bütün dünyaya yaklaşması değildir; sayfa dörtgeninin oda üstünde büyümesidir.

Dönüşte gerçek başlangıç 41 s'dir; 40–41 s diyagram sahnesi devam eder. `k=1-ease(t,41,44)`. Oda boyunca `wide(44,true)` çağrıldığı için arka plandaki oda pozu ve kamera 44 s durumunda sabitlenir. Texture da `diagram(40,true)` durumunda sabitlenir.

### warp() ne yapıyor?

`engine/warp.mjs:3`, `warp()` dört köşeyi bilinear interpolasyonla örnekler. Her hücre iki üçgene bölünür; her üçgen Canvas affine transform ile texture'lanır. Portal 7×7 hücre, 98 üçgen kullanır.

Bu mevcut ve işe yarar bir texture mesh temelidir. Ancak genel bir dörtgen için bilinear mapping, projective homography ile aynı değildir. Kodda 3×3 homography, perspektif bölmesi, ortak kamera pozu, sayfa normali veya fiziksel kitap derinliği yoktur. Grid'i sıklaştırmak projective model eksikliğini gidermez.

### Ölçülen içerik uyumsuzluğu

Kaynak koordinatlarından, kamera zoom'u uygulanmadan hesaplandı:

- `book()` küçük çizim A=(1073,827), B=(1241.9,838.5).
- Portalın `diagram()` A=(410,355), B=(1250,775) noktalarını aynı dörtgene bilinear yerleştirmesi: A≈(1081.83,838.14), B≈(1208.39,854.45).
- Farklar A≈14.21 px, B≈37.11 px. Oda zoom'u ekranda bu farkları büyütür. Bunlar bu denetimde çalıştırılan salt okunur matematik hesabıdır; yeni render ölçümü değildir.

Köşeler yaklaştırılsa bile iki farklı diyagramın endpoint, eğri ve font düzenleri uyuşmayacak. Dönüşte sikloidli folio `portal()`dan çıkınca `book()`ın ayrı doğru/quadratic çizimine dönülür. Aynı içerik sayfada yaşamaya devam etmez. 43 s ve 44 s encoded karelerinde bu temsil değişimi görülüyor.

Ayrıca `portal()` oda bittikten sonra çizildiğinden, texture mürekkep şişesi gibi kitap önündeki nesneleri de örtebilir. `room()` içinde bu nesneler kitabın üstüne çizilirken, portal kompozisyonunda hepsi texture'ın arkasına düşer. Sadece doğru dört köşe yeterli değildir; çizim/örtüşme sırası da ortak olmalıdır.

## 4. Kolların kök nedeni

İlgili kod: `character.mjs:39 sleeve()`, `:40 rig()`, `engine/math.mjs:6 ik()`, `motion.mjs:3 wristWorld()`, `room.mjs:53` ek el çizimi.

### Matematiksel uzunluk korunuyor, anatomik poz seçilmiyor

Sağ dirsek `ik(s2,h2,155,155,1)`, sol dirsek `ik(shoulder,h,130,125,-1)` ile çözülür. İki olası dirsek çözümünden sabit bend işaretiyle biri seçilir. Dirseğin gövdeye göre hangi tarafta durması gerektiği, omuz hareket aralığı, dirsek açı sınırı veya kol/gövde kesişimi değerlendirilmez. Sağ toplam uzunluk 310, sol 255 birimdir; fark yaklaşık %21.6. Stilize perspektif bilinçli bir neden olabilir, ama bu kodda oran kalibrasyonu yok; sağ uzunluk sayfaya erişimi artırmak için ayrı büyütülmüştür.

Bu denetimde mevcut sağ kol 0–10 s arasında 0.01 s aralıkla, 1001 pozda değerlendirildi:

- Segment uzunluğu hatası en fazla yaklaşık 1.14e−13; mevcut hareket için erişim sınırı aşımı bu bozuk görünümün temel sebebi değil.
- Dirsek iç açısı 5.63 s'de yaklaşık 35.87°'ye kadar kapanıyor. Bu açı tek başına anatomik imkânsızlık kanıtı değildir; gövde üstüne katlanan poz ve kol silüetiyle birlikte sorun yaratır.
- 5.5 s'de omuz=(54,−52), dirsek≈(−57.11,56.07), bilek≈(97.82,60.83). Üst kol gövde içine yönelip ön kol tekrar sağa dönüyor.
- 6 s'de dirsek≈(−97.23,−85.97): omuzun yaklaşık 34 birim üstüne ve 151 birim soluna taşınıyor. Omuz sabit kalırken bu çapraz erişim için destekleyici omuz/beden hareketi yok.

`sleeve()` kolu 65/58 px kalınlığında üç noktalı polyline olarak çizer; altındaki lineJoin round olsa da omuz-dirsek-bilek merkez hattı sert bir kırık çizgidir. Eklem uzunluğu doğru olabilirken manşet ve kol silüeti yamuk görünür. Yeni yüz veya beden tasarımı gerekmiyor; poz seçimi ve kolun çizilme biçimi düzeltilmeli.

`rig()` eli yerel koordinatlarda çizer; `room()` 4.1–6.15 s arasında aynı dünya bileğinde bir el daha çizer. İkinci çizim, elin kitap üstünde görünmesini sağlamak için eklenmiş bir katman düzeltmesidir. Bilek konumu eşleştirilse de ortak pose/depth sahipliği yok; yerel ve dünya el rotasyonları da tam aynı değildir. Bu fark ana kol bozukluğunun nedeni değildir, fakat kalıcı çözümde çift el çizimi yerine tek el ve doğru örtüşme sırası kullanılmalıdır.

`ik()` erişilemeyen hedefte mesafeyi clamp eder ama hedef bileği yeniden projekte etmez; gelecekte segment uzunluğunu bozabilecek bir yardımcı-fonksiyon sınırı da vardır. Mevcut taramada bu sınır tetiklenmedi. Tek bir sol kol pozunu kontrol eden mevcut test bunu kapsamıyor.

## 5. Uzun statik sahneler ve zamanın sahipliği

`diagram()` içinde kamera hareketi yok. Draw easing'leri bittiğinde raylar sabit; cisimler B'ye vardıktan sonra `track.at()` son noktayı döndürüyor; saat de clamp ediliyor. Metin durumları sabitken bilimsel görüntü tamamen duruyor.

Kaynak zaman hesabı, altyazı/HUD hariç:

- İlk yarış en geç 20.32046 s'de biter; 24 s'ye kadar yaklaşık 3.68 s sabit bilimsel sahne vardır.
- İkinci yarış 36.82046 s'de biter; 38 s'ye kadar yaklaşık 1.18 s sabittir. 38–39 s açıklama değişir; 39–41 s tekrar 2 s sabittir.
- Portal girişinde `diagram(14, false)`, dönüşte `diagram(40,true)` dondurulmuş içeriktir. Dönüşte oda da sabit 44 s pozu olduğundan yalnızca overlay dörtgeni hareket eder.

`production.mjs` içindeki `shots` açıklayıcı metadata; `seek()` doğrudan bu shot verisinden yürütülmez. `events` ses üretiminde kullanılır, fakat sayfa/rig/portal hareketleri kendi fonksiyonlarındaki ayrı sabit zamanlara dayanır. “Shared audio events” testi iki veri listesinin eşitliğini ölçer; görünen hareketin gerçekten o olayla başladığını ölçmez.

Çözüm her şeye rastgele hareket eklemek değildir. Anlatıdaki bekleme bilinçli bir hold ise kaydedilmeli; aksi hâlde mevcut aynı folio içinde anlamlı odaklama, takip veya sonuç karşılaştırması olmalı. Yeni sahne sayısı/stil değişimi gerekmiyor.

## 6. Önceki kalite incelemesinin gerçek kapsamı ve kaçırma nedeni

### Üretilen inceleme materyali

`tools/capture.mjs:9–11`:

- Final için 0–47.5 s arasında 0.5 s aralıklarla 96 browser kare: 2 FPS contact sheet, dört contact-page.
- Quick aşamada 15 seçili zaman.
- El/sayfa 3.8–7.8 s, giriş 10–14 s, yarış 34–38 s, dönüş 41–44 s: her biri 13 kare. İlk üçü yaklaşık 3 FPS, dönüş 4 FPS. Bunlar 30 FPS kare kare inceleme değildir.
- **24–29 s pageTurn için ayrı temporal strip tanımlanmamış.**

`tools/review-encoded.py:7–25`:

- Kodlanmış MP4'ten 31 seçili kare: 0, 2, 4.7, 5.5, 6, 7, 10, 11, 12, 13, 14, 16, 18, 19.5, 21, 24, 25.5, 27, 29, 31, 34, 35.5, 36.3, 37, 39, 41, 42, 43, 44, 46, 47.96 s.
- 12 FPS şeritler: el 4.5–6.5 s, yarış 34–37 s, giriş 11.2–13.2 s, dönüş 41.5–43.5 s. Bu, her render karesinin incelendiği anlamına gelmez.
- 5.5 s karesinden yüz/el ve sayfa-temas crop'ları.
- **Burada da 24–29 s ayrı şerit yok.** Giriş/dönüş 12 FPS şeritleri geçişlerin bütününü ve sınırlarını kapsamıyor.

### Gerçekten açılmış materyal

Önceki oturumun araç çağrılarıyla desteklenenler:

- Karşılaştırmanın A 4.5 s karesi.
- round-1 contact sheet ve el/sayfa sheet.
- round-2 19.5 s tam kare ve el/sayfa sheet.
- round-3 giriş ve dönüş sheet'leri.
- final giriş/yarış sheet'leri, 28 s tam kare ve final contact-page-1…4.
- encoded contact sheet, face-hand-crop, hand-strip; sonrasında encoded-30 (47.96 s), race-strip ve return-strip.

`encoded/portal-strip.jpg` ve `page-contact-crop.png` üretilmişti; önceki araç kaydında ayrı açıldıklarına dair kanıt yok. 25.5 ve 27 s kareleri contact sheet içinde vardı, fakat önceki oturumda tek tek tam çözünürlükte açılmadılar. Dosyanın varlığını görüntünün incelenmesiyle eşitlemiyorum.

Bu rapor sırasında mevcut `face-hand-crop.png`, `encoded-08.png` (12 s), `encoded-16.png` (25.5 s), `encoded-17.png` (27 s), `encoded-27.png` (43 s), `encoded-28.png` (44 s) ayrıca açıldı. İlgili mevcut kaynaklar ve manifestler okundu; yukarıdaki matematik taramaları yeni kod dosyası oluşturmadan çalıştırıldı.

### Teknik kontroller neyi ölçtü?

`tools/verify.mjs` çözünürlük/FPS/kare sayısı/codec/renk/süre, tüm video decode, boş kare, browser exception, 19 zamanda tekrar/cold-seek hash, 192 zamanda metin kutusu taşması, ses slotları/olay listeleri, stereo peak ve fizik süre sırasını kontrol etti.

Hareket kontrolü 96×54 gri görüntüde tüm kareye yayılan ortalama fark ve 25/255 eşikten ibaret. Yavaşça büyüyen yanlış overlay veya sayfaya yapışmayan yazı bu eşiği aşmak zorunda değildir. Ekran sınırına sığan 1696 metni, yanlış sayfanın üstünde olsa da “text overflow” testini geçer. Portal texture'ındaki yazı ölçümleri texture canvas'ında yapılır; son warp sonrası fiziksel sayfa containment kontrolü yoktur.

Testlerde sayfa/UV sahipliği, A/B'nin kitapla eşleşmesi, ön/arka yüz görünürlüğü, prop örtüşmesi, dirsek pozu, geçiş uçlarında içerik devamlılığı veya durağanlık süresi yok. Determinism testi yanlış görüntünün her seferinde aynı olmasını da başarılı sayar.

### Neden tespit edilmedi?

Eksik temporal kapsam ve thumbnail ölçeği katkıda bulundu; ama tek açıklama bunlar değil. Bazı kusurlar açılan sheet'lerde de görülebiliyordu. Önceki görsel değerlendirmem, temiz kenar ve akıcı ölçek değişimini fiziksel yüzey devamlılığından yeterince ayırmadı. Kol teması düzelince anatomik pozu gereğinden olumlu değerlendirdim. “Geçiş ve temas düzeltildi” ifadeleri bu nedenle kapsamından genişti; teknik testlerin geçmesi yapısal kaliteyi doğrulamıyordu.

## 7. Mevcut motor üzerinde önerilen dar kapsamlı çözüm

Aşağıdaki adlar **öneridir**, mevcut projede bu API'ler henüz yoktur. Hiçbiri bu incelemede uygulanmadı.

### A. Tek sayfa sahibi ve tek içerik kaynağı

Book'a bağlı küçük bir `PageSurface` tanımı: fiziksel/local boyut, UV alanı, binding/spine, yüzey geometrisi, ön/arka içerik kimliği, pose ve görünürlük bilgisi. Bütün dünya için genel scene graph kurmak gerekmez.

`renderPageContent(contentId, contentTime, targetCtx)` mevcut `diagram()` çizimlerini kullanır. Aynı texture hem kitap içinde hem yakın planda kullanılır. 1696 başlığı yeni sayfanın içeriğine dahil edilir; eski sayfa üstüne ekran etiketi olarak çizilmez. Altyazı ve film kimliği ekran katmanında kalır.

Kitabın mevcut küçük çizimi için ayrı `line()/quadratic` tarifi kaldırılacak; sayfanın aynı içerik durumu küçük ölçekte gösterilecek. Materyallerin ve harflerin stilini değiştirmek gerekmez. Parşömen/ışık çiziminin sorumluluğu net seçilmeli; mevcut texture ile surface material gereksiz yere iki kez uygulanmamalı.

### B. Tek koordinat zinciri

Page UV → page local → book/world → camera → screen. Kitap, portal ve parmak temas konumu aynı yüzey değerlendirmesinden türetilmeli. Elle ikinci bir köşe listesi tutulmamalı.

Mevcut kitap dış silüeti korunarak görünen sayfa sınırı bir kez kalibre edilir. Eğri kenarlar UV mesh/boundary ile uyumlu temsil edilir. 2D illüstrasyondan tek bir fiziksel 3D kamera geri çıkarılamaz; seçilen model mevcut onaylı görüntüye kalibre edilmiş bir temsil olur. Bu belirsizlik gizlenmemeli.

Düz sayfa projeksiyonu için homography veya küçük bir matematiksel kamera/projeksiyon yardımcı fonksiyonu yeterlidir. Yakınlaşmada sayfa köşelerini keyfî ayrı mix etmek yerine, ortak projeksiyon/kamera ve sayfa pozu ilerletilir. Aynı yüzey noktalarının bütün geçiş boyunca aynı nesneye bağlı kalması zorunludur. Bükülen sayfa için homography tek başına yetmez; mesh gerekir.

### C. İçerikle birlikte bükülen sayfa

Mevcut üçgen texture çizme yaklaşımı korunur. `warp()` dar bir genişletmeyle dört köşe yerine hesaplanmış mesh vertex'leri/UV'leri alabilir. Her vertex'in dönüşümü sayfa-local koordinatlarda deterministik bir curl/spine fonksiyonundan hesaplanır.

Eski sayfanın ön dokusu bu mesh'e render edilir. Arka yüz için ayrı materyal/texture ve normal/görünürlük kararı gerekir. Yeni sayfa arkada kendi yüzeyinde kalır. Derinlik ve ön/arka görünürlüğe göre maskeler/üçgen çizim sırası belirlenir. Gradient kıvrım fiziksel mesh'e bağlı bir gölgeleme katmanı olabilir; içeriğin yerine geçen bağımsız şerit olmamalı.

Canvas 2D üçgen clip ve affine texture çizimini zaten yapıyor. Yüzey deformasyon matematiği JavaScript'te hesaplanabilir; bunun için Three.js, WebGL veya yeni framework zorunlu değil. Üçgen örtüşmesi, ters dönen hücreler ve kenar örnekleme ilgili kısa sahnede test edilmeli. Karmaşık self-occlusion için bu yaklaşımın yetmediği ölçülürse ancak o zaman daha ileri renderer değerlendirilmeli.

### D. Kitap ve prop örtüşme sırası

Odayı yeniden çizmek yerine mevcut room çizimini sınırlı katmanlara ayırmak yeterli: arka ortam/beden, masa ve kitap gövdesi, sayfa yüzeyleri, temas eden el ve öndeki props. Tek el doğru sırada çizilmeli; ikinci el overpaint'i gerekmemeli. Sayfa texture'ı kitap maskesi dışına taşmamalı, ink bottle gibi öndeki props tarafından doğru örtülmeli.

### E. Kol pozunu ve silüetini düzeltme

Yüz ve torso tasarımı korunur. Omuz bağlantı noktaları/projeksiyondaki kol uzunlukları onaylı rest pose'a göre birlikte kalibre edilir. IK'ye dirsek hedef yönü (pole), poz sürekliliği, artistik/anatomik açı aralıkları ve gövdeye göre taraf kısıtları eklenir. Kısıtlar gerçekten erişimi engellerse omuz/beden küçük destek hareketi veya page contact aralığı çözülür; kolu tek başına uzatmak çözüm olmaz.

Bu seçim seek(t) geçmişinden bağımsız olmalı: pole/pose eğrileri zaman fonksiyonundan türetilmeli, önceki frame dirseğine bağlı state kullanılmamalı. Üst kol/ön kol/manşet mevcut renk ve çizgiyle ayrı, eklemde örtüşen path'lerle çizilebilir; kalın zigzag merkez hattı kolun dış konturunu tek başına belirlememeli. El rotasyonu ön kol ve kavrama pozundan türetilmeli. Prop anchor'ı da aynı pose çıktısını kullanmalı.

### F. Zaman ve statik hold sözleşmesi

Sadece ilgili hareketlerin zamanları production verisinden türetilir; mevcut bütün film yeniden tasarlanmaz. Açılış, sayfa dönüşü, reader odaklanması, return ve rig contact tek olay/clip verisine bağlanır. Hold aralıkları bilinçli tanımlanır. Anlamlı yakınlaşma/takip mevcut çizim alanındaki odak noktasına uygulanır; bilimsel dünya geometrisi bozulmaz. Süre/opacity ayarı sahiplik çözümünün yerine geçmez.

## 8. Tekrar kullanılabilirlik ve kabul ölçütleri

Evet, bu mekanikler sonraki filmlerde ortak PageSurface/projection/mesh/pose yardımcıları olarak tekrar kullanılabilir. Bugünkü `portal()` ve `pageTurn()` doğrudan kopyalanırsa aynı kusurlar da taşınır. Güvenilirlik, yalnızca fonksiyonu engine/ altına taşımakla sağlanmaz.

Önerilen doğrulama paketi:

1. **Yüzey ankrajları:** spine, köşeler, A/B ve metin referans noktalarının ileri/ters projeksiyonunda 1080p ekranda hedef ≤1 px hata. Geçiş uçlarında aynı contentId/state ve aynı yüzey pozu. Sayısal toleranslar ilk deneyde kalibre edilmeli.
2. **İçerik sahipliği:** ön yüzdeki her sayfa öğesi aynı UV/mesh transformunu paylaşmalı. Yeni bölüm metni yeni sayfanın görünür maskesi dışına çıkmamalı. HUD/altyazı bu testten bilinçli olarak ayrı.
3. **Kıvrım:** UV checkboard ve harfli test texture'ıyla mesh yönü, ön/arka yüz, katlanan çizgilerin izlenmesi, NaN/ters hücre/self-intersection ve çizim sırası kontrolü. Bu test texture'ı final sanatına girmez.
4. **Temas/rig:** mevcut sağ/sol bütün hareket boyunca uzunluk, açı, pole tarafı, erişim, gövde/kol kesişimi ve parmak-sayfa mesafesi. IK uzunluğu tek başına anatomik kabul değildir; onaylı pose sheet ayrıca gerekir.
5. **Temporal inceleme:** 9.5–14.5, 23.5–29.5 ve 40.5–44.5 s tam aralıkları; 30 FPS sınır komşuları ve 12 FPS okunabilir şeritler. Özellikle 1696 metni ilk göründüğü an, fold omurgayı geçtiği an ve kitabın üstüne yerleştiği son kareler tam çözünürlükte açılmalı.
6. **Durağanlık:** HUD/altyazı çıkarılmış sahne ROI'sinde hareket/odak değişimini ölç; uzun hold'ları işaretle, otomatik olarak hata sayma. Anlatı gerekçesiyle kabul et veya odak hareketiyle geliştir.
7. **Stil koruma:** mevcut oda/yüz/palet/font kareleri baseline alınır. Sayfa ve kollar için izin verilen değişiklik bölgeleri dışında görsel fark raporu; tam resim hash'inin aynı kalması beklenmez. Materyal/typography yeniden üretilmez.
8. **Genelleme deneyi:** aynı yüzey mekaniği en az iki farklı sayfa içeriği ve ikinci kitap pozu/ölçeğinde çalıştırılmalı. Bunlar yeni bir tam film gerektirmez. Aynı timestamp farklı sırada seek edilerek hash kontrolü ve gerçek encoded-frame incelemesi sürdürülmeli.

Uygulama sırası önerisi: stil baseline → ortak içerik/yüzey ve ankraj deneyi → giriş/dönüş → gerçek sayfa curl → anatomik kol/tek-el örtüşmesi → tam geçiş denetimi → ancak sonra tam film. Bu sıranın hiçbiri bu rapor aşamasında uygulanmadı.

## Karar

Onaylanmış görsel kalite korunabilir. Gerekli yatırım yeni çizim sistemi değil, mevcut Canvas motorunda dar kapsamlı ortak yüzey/projeksiyon ve pose sözleşmesidir. Gerçek yüzey deformasyonu ve kabul testleri henüz uygulanıp render edilmediği için çözümün başarılı olduğu iddia edilmiyor. Mevcut koddan motorun yeniden yazılmasını gerektiren bir engel bulunmadı.
