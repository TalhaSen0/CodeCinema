# Animasyon kalite sözleşmesi v1

16 Ekim 2026. İlk kapsam: filmden bağımsız ilişki laboratuvarı ve Galileo regresyonu.
Bu eşikler 1920×1080 referans pikselleridir; farklı çıktı boyutlarında ölçeklenir.
Başarılı test artistik onay değildir. Eşikler evrensel fizik kuralları değil, bu sürümün
ilan edilmiş kabul sınırlarıdır; değiştirilirse gerekçesi ve önce/sonra kanıtı kaydedilir.

## Hata sınıfları ve teslim kapısı

| Sınıf | Kabul sınırı | Denetim | Sonuç |
| --- | --- | --- | --- |
| Bağlantı kopması | Ortak eklem uçları dünyada ≤0.01 birim; raster işaretleri ekranda ≤3 px | Bağımsız uç noktalar, ID renkli gerçek raster | İhlal teslimi durdurur |
| Temas kaybı | Kavrama ve destek aralığında ≤0.5 dünya birimi / ≤3 ekran px | Sahip yüzeyin anchor'ı ile çizilen nesne/elin anchor'ı karşılaştırılır | İhlal teslimi durdurur |
| Yanlış örtüşme | İlan edilmiş örtüşme noktasında doğru ön nesne; sınırın ≥3 px içi | Sıra bağımlılıkları + gerçek raster ID pikseli | İhlal teslimi durdurur; belirsiz kenar insan incelemesi |
| Biçim bozulması | Kemik uzunluğu göreli hata ≤0.1%; yüzey/nesne ilan edilmiş sınırlar içinde; tüm değerler sonlu | Uzunluk, sınır kutusu, projektif payda; dense örnekleme | İhlal teslimi durdurur |
| Perspektif tutarsızlığı | Aynı dünya anchor'ının kamera altında farkı ≤3 px | Tek kamera zinciri + bağımsız matris referansı + raster | İhlal teslimi durdurur |
| Zamansal sıçrama | Kesmesiz sahiplik sınırında ±0.0001 s farkı ≤0.5 px; hareket hızı senaryo bütçesi içinde | 120 Hz geometri, 30 FPS video, cold seek hash | İhlal teslimi durdurur; hız alarmı açıklama gerektirir |

Eksik örnek, NaN, eksik raster işareti, eksik zorunlu kanıt ve browser hatası başarısızlıktır.
Esnek laboratuvar yüzeyinde ayrıca kamera öncesi 3D malzeme metriği ölçülür:
en, boy ve çapraz komşuluklarda göreli uzunluk hatası ≤%0.1. İzin verilen kutunun
içinde kalmak bu ölçümün yerine geçmez; %2 yüzey uzaması bile teslimi durdurur.
Laboratuvar sayfasının uç poz sözleşmesi sağ–sol aynalamadır: yerel x işaret
değiştirir, y/z korunur; başlangıç ve bitişte orta nokta iki uçtan yukarıda kalır.
Kasıtlı kurgu kesmesi shot verisinde önceden tanımlanır; otomatik eşik gevşetilmez.
3 px tolerans karakterin elle düzeltilebilirliğinin garantisi değildir.

## İlişki sözleşmesi

- Her node'un kararlı ID'si ve her anda tek parent'ı vardır. Eksik parent/döngü reddedilir.
- Local → parent → world → camera → screen sırası tek yerde hesaplanır.
- Bir prop'un kavrama noktası yerel koordinatta tanımlıdır; nesnenin merkezi elin kopyası değildir.
- Taşıyan yüzey anchor'ı UV'den örneklenir. Kamera değişimi UV'yi veya temas sahibini değiştirmez.
- Kavrama/bırakma aralıkları mutlak zamandan seçilir. Parent değişiminde iki poz C0 devamlılık sağlamalıdır.
- Örtüşme `behind → front` bağımlılığıdır. Çizim sırası aynı plandan üretilir; kamera/temas bunu örtük olarak belirlemez.
- Esnek yüzeyde nokta takibi ve rijit nesne yönelimi ayrı sorumluluklardır. Gerçek hacim/çarpışma/3D orbit v1 kapsamı dışındadır.
- Düzeltici çizim, denetim için farklı ve kusursuz sahte koordinatlar bildiremez. Raster denetimi bu nedenle ayrıca gerekir.

## Mevcut altyapıdan çıkarım

PageSurface UV sahipliği, motion.mjs el teması ve katman ayrımı mevcut. Eksikler:
filmden bağımsız parent/anchor çözümü, bildirimsel örtüşme, sahiplik devri,
denetleyiciye kasıtlı hata enjeksiyonu ve genellenebilir senaryo matrisi.
Yeni renderer gerekçesi henüz yok; Canvas/Opus korunur. Yeni mekanikler önce laboratuvarda
kanıtlanır, Galileo'ya ancak görünür gereksinim ve karşılaştırma kanıtıyla taşınır.

## Denetleyicinin denetimi

Temiz örneklerin yanında kopuk bilek, havada prop, yanlış ön/arka sıra, uzamış prop/yüzey,
yalnız prop'a farklı kamera ve sahiplik anında poz sıçraması ayrı ayrı enjekte edilir.
Geometrik ve raster testler ayrı raporlanır. Her hata için beklenen sınıf, tespit ve
yanlış alarm sayısı saklanır. Bu küçük sentetik corpus'taki oran gerçek filmlere genellenmez.

## Düzeltme ve teslim

1. Baseline kaynak/video hash'lerini koru; yalnız hedef mekanikte değişiklik yap.
2. Birim + kasıtlı hata testleri; sonra yerel klip, contact sheet ve yoğun şeritler.
3. Kusur bulunursa zaman, node, sınıf ve ölçümü kaydet; en fazla üç yerel düzeltme turu.
4. Düzeltme ardından temiz örnekleri ve Galileo regresyonunu tekrar çalıştır.
5. Final için bütün zorunlu kontroller ve ayrı görsel inceleme gerekir. Eksik inceleme `review-required`, başarısız ölçüm `blocked` olur.
6. Otomatik onarım v1'de yok. Hata gizlemek için clamp, katman değişimi veya eşik yükseltme uygulanmaz.
7. Ses için kod/model/decoder lisansı ve kaynak sürümü kaydedilir. Eski Piper WAV/mix yeni ticari aday çıktısına taşınmaz.

## Senaryo listesi

| ID | İçerik | Varyasyon / kanıt |
| --- | --- | --- |
| handoff | Karakter uzanır, kavrar, taşır, bırakır | Üç ölçek/oran/kamera; 1 ve 4 s sahiplik sınırları |
| occlusion | Prop ön plandaki dar direğin arkasından geçer | Kamera projektif değişirken gerçek ID pikseli |
| flexible | UV işaretleriyle bükülen yüzey | Üç en/boy oranı, eğim; sonlu olmanın yanında boyut sınırı |
| detector-mutants | Altı sınıfın kasıtlı kusurları | Temiz/bozuk ayrımı, beklenen sınıf, yanlış alarm |
| galileo | Onaylı 48 saniyelik v2 | Mevcut 13 test, yüzey kontrolü, 23.5–29.5 s dense kanıt |
| future-short-films | Farklı karakter/nesne/kamera ile kısa anlatılar | Laboratuvarın yerine geçmez; artistik kaçırmalar ayrıca kaydedilir |

## Yol haritası

1. Bu sözleşme ve senaryolar; baseline kaydı.
2. Saf zaman tabanlı ilişki/anchor/çizim sırası yardımcıları; filmden bağımsız laboratuvar.
3. Hata enjeksiyonu, raster ve encoded klip kanıtları; yanlış alarm raporu.
4. Türkçe ticari lisanslı ses adayı: izole ortam, sabit kaynak sürümleri, gerçek örnekler ve lisans manifesti.
5. Sesin dinleme değerlendirmesi; onaylanan anlatımla yeni mix/video ve teknik teslim denetimi.
6. Farklı kısa filmler; insan incelemesinin kaçırılan kusur ölçümleriyle kademeli azaltılması.

Inochi2D, LayerDiffuse ve ACE-Step ancak ölçülmüş bir açığı kapatan ayrı deneylerdir;
bu aşamalar bitmeden üretim bağımlılığı yapılmaz.
