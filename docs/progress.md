## 17 Ekim — Salıncağın Sırrı 1080p sesli final teslimi

Hugging Face token ile kimlik doğrulandı; dördüncü anlatım cümlesi kilitli tok erkek sesiyle (Alania d1-02552 + Chatterbox Multilingual) 5.52 s olarak üretildi. Dört cümlenin tamamı zaman slotlarına uydu, özgün prosedürel nota/tık senteziyle mikslendi (tepe 0.453, clipping yok).
1920×1080 @ 30 FPS, H.264/AAC, CRF 17 final render alındı: `renders/salincagin-sirri/2026-10-16-v1/final.mp4` (32.0 s, 960 kare).
Decode ve süreklilik kontrolleri geçti: FFmpeg tam decode hatasız, tarayıcıda on soğuk ve tekrarlı seek birebir aynı SHA-256 hash verdi, metin taşması yok. Kanıt: `renders/salincagin-sirri/2026-10-16-v1/review/`.

## 16 Ekim — Anlatıcı kullanıcı tarafından kilitlendi

Kullanıcı d1-02552 sesini çok iyi buldu ve kilitlenmesini istedi. Seçim assets/selected-voice.json ve assets/voices/codecinema-narrator/voice-lock.json içinde. Referans, onaylı işlenmiş örnek, ham örnek ve atıf ayrı korunmuş kopyalara alındı; SHA-256 doğrulandı. Üretim aracı yalnız seçili referansı ve kilitli ayarları kullanır; alternatif ses denemesi artık varsayılan değil. Bu, anlatıcı seçimi onayıdır; tüm filmin yeni sesle üretildiği anlamına gelmez.

## 16 Ekim — Ticari izinli sentetik tok erkek aday

Alania voices CC BY 4.0 kaynağından iki tasarlanmış Türkçe erkek referansı seçildi; yayıncı gerçek kişi sesi içermediğini ve ticari uyarlamayı açıkça belirtiyor. İlk referans d1-02552 ile 6.48 s yeni Chatterbox örneği üretildi ve hafif temizlendi. İkinci istek ZeroGPU kotası nedeniyle reddedildi; ikinci ses henüz üretilmedi. Lisans/atıf ve hash kayıtları saklandı. Ses rengi ve doğallık dinleme onayı bekleniyor; mevcut final değişmedi. Ayrıntı: docs/male-voice-selection.md.

## 16 Ekim — Yerel otomatik hizalama deneyi

Kullanıcı elle sınırlandırılmış temiz sesi onayladı; onay listening-review.json içine hash ile kaydedildi. Whisper tiny + stable-ts yerel CPU üzerinde iki Türkçe cue için çalıştı. İlk cümle bitişi 4.06 s; belirsizlik payıyla 4.16 s sınırı kullanıldı. İkinci cue sıfır süreli kelime/düşük olasılık nedeniyle tamamen korundu. Ayrı otomatik aday 13.08 s; onaylı konuşma bölgesi birebir aynı, hedef kuyruk sıfır. Dört test (bozuk hizalama alt durumları dahil) geçti. Genel otomatik kalite veya yeni dinleme onayı iddiası yok. Demo referansının ticari izni hâlâ açık; mevcut final değişmedi. Ayrıntı: docs/speech-alignment.md.

## 16 Ekim — Cümle arası ses kuyruğu

İlk Chatterbox cümlesinin sonunda 4.47–4.99 s düşük seviyeli aktivite saptandı; eklenen bir saniyelik ara zaten sessiz. Geçici 4.145083 s konuşma sınırıyla 100 ms pay + 10 ms fade uygulandı. Yeni listening-reel-pauses-clean.wav 13.08 s; konuşma bölgeleri ve ikinci cümle birebir korundu, hedef ara tam sıfır. Konuşma sınırı insan dinleme onayı bekliyor; metin hizalama/otomatik konuşma algılama tamamlanmış değil. Araç: tools/speech-envelope.py.

## 16 Ekim — Chatterbox aday kabulü ve hafif cilalama

Kullanıcı demo sesini Freya’dan daha iyi buldu; ticari uygunluk şartıyla devam etmek istiyor. FFmpeg afftdn ile 13.08 saniyelik hafif temizleme ve 27.16 saniyelik önce/sonra karşılaştırması üretildi. RMS eşit, tempo değişmedi, ham ses korundu. Teknik kontroller geçti; cilalı sesin öznel onayı bekleniyor. MIT kod/model doğrulandı; demo referansına ticari izin bulunamadı (resmi tartışma #45). Yerel kurulum hâlâ eksik, mevcut final MP4 değişmedi. Ayrıntı: docs/commercial-voice.md ve polish-review.json.

# Üretim kaydı

## 16 Ekim — Chatterbox gerçek dinleme örneği

Yerel V3 indirmesi tekrar denendi; araca devam edebilen parça indirmesi ve
tam dosyada SHA-256 doğrulaması eklendi. Düşük aktarım hızı nedeniyle yerel
kurulum tamamlanamadı. Resmi Multilingual Space üzerinden iki Türkçe cümle
üretildi: 5.16 ve 6.92 saniye, toplam dinleme 13.08 saniye. Çalışan ağırlık
sürümü doğrulanmadığından V3 benchmark'ı olarak sunulmaz. Varsayılan Türkçe
demo referansının ayrı ticari hakları henüz doğrulanmadı; final kullanımı yok.
Dinleme kopyasında yalnız -6 dB kazanç, ham sesler korunuyor. Kanıt ve dosyalar:
`films/galileo/assets/auditions/chatterbox-hosted/`. Kullanıcı dinlemesi bekleniyor.

## 16 Ekim — sayfa uç pozunda kavis aynalama

Kullanıcının sonraki bildirimi: uzama çözülmüş, ancak son pozda üst kavis alt
kavise dönüyor. Laboratuvar yüzeyinin dinlenme eğriliği dönüşle beraber yumuşakça
değiştirilerek son şekil sağ–sol aynalama sözleşmesine bağlandı. Uzunluk korunuyor;
sıfır eğrilik geçişi kararlı integral ile hesaplanıyor. 23 test ve Galileo
regresyonu geçti. Üç yeni videonun 15 Hz yoğun kâğıt şeritleri açılıp incelendi.
Eski/yeni: `review/relationships/comparison/mirror-before-after.mp4`, sol önceki,
sağ düzeltilmiş. Ayrıntılar `docs/sheet-stretch-fix.md` içinde.

## 16 Ekim — kullanıcı tarafından bulunan kâğıt uzaması

Kullanıcının ilişki laboratuvarındaki kâğıt uzaması bildirimi doğrulandı: eski
orta çizginin görünür yay uzunluğu dönüşte yaklaşık %38 artıyordu. Bu kusur önceki
denetim ve görsel incelemede kaçmıştı. Laboratuvara malzeme uzunluğunu koruyan
silindirik yüzey ve %0.1 strain kapısı eklendi. %2 yüzey uzaması ayrı kasıtlı
kusur testinde yakalanıyor. 22 test, üç yeniden kodlanmış klip ve Galileo regresyonu
geçti. Üç yüzeyin 15 Hz yoğun encoded şeritlerinin tamamı açıldı ve incelendi.
Ayrıntı: `docs/sheet-stretch-fix.md`. Eski/yeni yakın plan video:
`review/relationships/comparison/before-after.mp4` (sol eski, sağ yeni).

## 16 Ekim — dinleme reddi ve laboratuvara erişim

Kullanıcı Freya örneğini cızırtılı ve düşük kaliteli buldu; bu aday reddedildi.
Dinleme kaydı `films/galileo/assets/commercial-freya/listening-review.json` içinde.
Teknik sessizlik/clipping kontrolü algısal onay yerine geçmedi.
Laboratuvar HTTP üzerinden açıldı; oynatma/duraklatma, düzen ve kusur seçicileri
eklendi. 21 kombinasyonda browser hatası yok, temiz canvas önceki PNG ile birebir
aynı, hazır video HTTP 200. Kanıt `review/relationships/ui-verification.json`.

Chatterbox Multilingual V3 için sabit kaynak/model sürümleri, 3.3 GB sınırı ve
iki cümlelik benchmark aracı hazırlandı. Paket ve model indirme sorunları nedeniyle
çıkarım yapılamadı; alternatif ses üretildi veya kaliteli bulundu iddiası yok.
Bu deney tamamlanmış üretim bağımlılığı değildir. Mevcut film/ses korunuyor.

## 16 Ekim — ilişki sözleşmesi ve bağımsız test altyapısı

Kalite sözleşmesi, altı hata sınıfı, kabul eşikleri ve aşamalı yol haritası
`docs/quality-contract.md` içinde. Ortak dönüşüm/anchor/örtüşme yardımcıları ve
üç varyasyonlu ilişki laboratuvarı uygulandı. 20 test, 18 kasıtlı hata, 12 raster
vakası, üç gerçek klip ve Galileo regresyonu geçti. Yoğun kodlanmış şeritler açıldı;
gözlenen iki görsel fikstür kusuru düzeltildi. Kapsam ve sınırlar
`docs/relationship-lab-results.md` içinde. İnsan inceleme kapısı korunuyor.

Türkçe ticari ses adayı FreyaTTS için izole Python/CUDA ortamı, sabit model/kod
sürümleri ve Piper çıktılarından ayrı üretim yolu eklendi. Güncel ses durumu
`docs/commercial-voice.md` içinde; eski sesli MP4'lerin noncommercial sınırı sürüyor.

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

## 16 Ekim — onaylı geçiş düzeltmesi

Önce cc2b213 Git baseline ve eski MP4 korundu. PageSurface/homography/textured curl, ortak kitap UV içeriği, anatomik IK ve temporal QA uygulandı. Yerel testlerde omuz boşluğu, kitap dışı projektif tekillik, ön plan sıçraması ve küçük doku aliasing bulunup düzeltildi. Yerel klipler geçtikten sonra tam taslak ve final render edildi. Güncel kanıt ve sınırlar docs/page-surface-implementation.md içinde; teslim galileo-final-v2.mp4 ve yan yana galileo-before-after.mp4.
