# Galileo — kalite ve teslim raporu

16 Ekim 2026. Son teslim: `renders/galileo-final.mp4`, 48 saniye, 1920×1080, 30 FPS, 1.440 kare, H.264 High/yuv420p/BT.709 limited, AAC stereo. Aynı görüntünün yalnızca özgün müzik/efekt içeren `galileo-music-only.mp4` sürümü ayrıca sağlanır. Kaynak ve dosya SHA-256'ları delivery-manifest.json içinde.

## Gerçek inceleme ve düzeltmeler

**Tur 1 — ilk görseller ve hareket.** review/round-1/contact-sheet.jpg ve hand-page-sheet.jpg açıldı. Sayfa çevirme penceresi iki easing çarpımı nedeniyle geri dönerek ikinci hareket yaratıyordu; el sayfa kenarına temas etmiyordu. Dairesel yay etiket alanına yaklaşıyor, eksenler farklı ölçekte çiziliyordu. İlk çalışma odası karşılaştırma karesi ayrıca açıldı. Tam oda/karakter tasarımının stilize olduğu görüldü; profesyonel anatomi/acting iddiası yapılmadı.

**Tur 2 — temas ve geometri.** review/round-2/hand-page-sheet.jpg ve frame-019500.png açıldı. Tek yönlü pageState, bilekle ortak world anchor ve 155/155 uzunluklu sağ kol IK eklendi. Sayfa kenarı ilk temas aralığında el tarafından izleniyor; sonra el bırakıp masaya geri dönüyor. Diyagram eşit x/y ölçeğine geçirildi, alt yörünge/legend ayrıldı ve zaman göstergesi eklendi. A etiketi başlık alt satırına yaklaşıyordu; sola/alta alındı. Altyazı ayrı alt bantta tutuldu.

**Tur 3 — geçişler ve kodlanmış teslim.** review/round-3/portal-sheet.jpg ve return-sheet.jpg açıldı. Kitap sayfası dört köşeli düzlem üzerinden açılıp kapanacak şekilde değiştirildi. Bu adaptasyon ilk denemede üçgen clip kenarlarında ince çizgiler üretti; örtüşen clip ve dış quad maskesiyle düzeltildi. Portal bitiminde yarım çizginin tekrar kaybolması, geçiş boyunca sabit ilk bilimsel durum kullanılarak düzeltildi. Final portal ve race şeritleri açılıp doğrulandı.

Kodlanmış MP4'ten contact sheet, 12 FPS el/sayfa, yarış, giriş ve dönüş şeritleri, yüz/el 1:1 crop çıkarıldı. `review/encoded/contact-sheet.jpg`, `face-hand-crop.png` ve `hand-strip.jpg` gerçekten açıldı. İlk encoded inceleme kapanışın yerel zamanını tekrar 4–6 s'ye getirip ikinci bir sayfa çevirme başlattığını gösterdi. Closing rig zamanını 8 s sonrasındaki sakin harekete bağladık; tam video yeniden render edildi. Son kapanış karesi ve encoded hareket şeritleri yeniden açıldı. Bütün final 2 FPS taraması dört contact-page dosyası üzerinden incelendi.

Renk değişikliğiyle sınırlı bir revizyon yapılmadı: el/nesne teması, sayfa hareketinin yönü, fizik çiziminin geometrisi, açıklama yerleşimi, geçiş raster dikişleri ve kapanış devamlılığı düzeltildi.

## Teknik sonuç

`npm run verify` son final dosyasında geçti. Ayrıntı: verification.json.

- Dört fizik/IK testi başarılı: ortak endpoint ve geçerli enerji; analitik sürelerle quadrature uyumu; stateless/monotonik trajectory; kol segment uzunlukları.
- 1920×1080, 30/1 FPS, 1.440 decoded kare. Video ve ses süreleri 48.000 s.
- Tüm dosya FFmpeg -xerror ile decode edildi; bozuk frame raporu yok.
- Siyah/boş kare yok. Küçük gri-kare taramasında minimum ortalama 49.05, minimum standart sapma 30.66.
- Beklenmeyen büyük kare farkı eşiği 25/255; ölçülen en yüksek ortalama fark 3.40 civarı. Bu ölçüm hareketin sanatsal doğallığını kanıtlamaz.
- 19 farklı zamanda tekrar ve başka zamandan cold seek aynı SHA-256 görüntüyü verdi.
- 192 zaman örneğinde ölçülen metin kutusu taşması yok; browser exception yok. Bütün olası metin/nesne çakışmaları algoritmik çözülmüş sayılmıyor; görünür yerleşim ayrıca gözle kontrol edildi.
- Altı narration satırı kendi zaman slotlarına sığıyor; görsel ve ses olay listesi aynı. PCM/AAC stereo peak yaklaşık 0.895, clipping yok. İlk kontrolün mono downmix'i kanal toplam kazancı nedeniyle yanıltıcı tepe ölçmüş; ölçüm gerçek stereo kanallara düzeltildi.
- Kayıpsız PNG frame sequence komutu gerçekten çalıştırıldı: 4.7–5.0 s aralığında 9 kare ve manifest üretildi.
- Yeni konu CLI'sı gerçek pendulum brief'i ile çalıştırıldı; brief-ready iş emri oluştu. Bu ikinci film üretilmedi ve üretilmiş gibi sunulmuyor.

## Artistik değerlendirme ve kalan sınırlar

Karakter kimliği, kitap, mobilya, mum ve sıcak/soğuk palet tutarlı. Sayfa teması ve ağırlıklı kol yönü artık okunuyor. Bilimsel çizim gerçek ortak noktalar, eşit eksen ölçeği ve doğru model süreleri kullanıyor. Kitap ve kronolojik sayfa geçişleri anlatı bağlantısı kuruyor. Ses ve yazı aynı hikâyeyi izliyor.

Görsel düzey **detaylandırılmış prosedürel 2D illüstrasyon**. Tam yüz yaw rig'i, geniş mimik kütüphanesi, yürüyüş/oturma geçişleri, kapsamlı nesne alma-bırakma rig'i veya stüdyo düzeyinde karakter acting'i tamamlanmış değildir. Oda kamera yaklaşması kontrollüdür fakat tam 3D perspektif kamera değildir; page-plane geçişi kâğıdın açılması olarak okunur. Bu sınırlara rağmen basit geometrik şekil demosundan ileri, gerçek çizilmiş ortam ve tutarlı karakter içeren oynatılabilir bir film vardır.

Piper sesi baseline kalitede. Bu oturumda insan düzeyinde öznel dinleme değerlendirmesi yapılmış gibi kabul edilmedi. Chatterbox ve ACE-Step çıkarımları yapılmadı; yalnızca araştırıldı. Mevcut GPU'nun bunları çalıştıramayacağı kanıtlanmış değildir. Türkçe DFKI modelinin noncommercial kısıtı nedeniyle sesli sürüm ticari olmayan kullanım içindir; anlatıcısız özgün score sürümü bu modele bağımlı değildir.

Araştırma, senaryo, yeni çizim üretimi ve sanatsal görüntü incelemesi Codex oturumunda gerçekleşir. Yerel CLI otomatik render/ses/teknik review yapar; kendi başına herhangi bir konuyu anlayan çevrimdışı AI servis değildir. Bu ayrım README ve üretim iş emrinde açık.
