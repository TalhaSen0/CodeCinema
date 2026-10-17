# Laboratuvar kâğıdında uzama düzeltmesi

## Takip düzeltmesi: son pozdaki kavis yönü

Kullanıcı uzunluk düzeltmesini kabul etti; fakat başlangıçtaki üst kavisin
dönüş sonunda alt kavise döndüğünü bildirdi. İlk silindirik model yerel eğriliği
sabit tuttuğundan yarım tur sonunda derinlik işareti de ters dönüyordu.
İstenen uç poz sözleşmesi şimdi açık: kamera öncesi `x_final=-x_initial`,
`y_final=y_initial`, `z_final=z_initial`. Kâğıdın ortası iki uçtan yukarıda kalır.
Kamera ve karakter kök dönüşümü ayrıca hareket ettiği için tüm ekranın birebir
ayna görüntüsü beklenmez; bu sözleşme kâğıdın yerel şekli içindir.

Dinlenme eğriliği dönüş boyunca yumuşakça işaret değiştirir. Yay uzunluğu
parametresi korunur. Sıfır eğrilikten geçişte kararlı sinc integrali kullanılır;
bölme tekilliği veya son karede poz düzeltmesi yapılmaz. Dört en/boyda bütün
uç poz noktaları, kavis yönü ve sıfır eğrilik çevresindeki devamlılık test edilir.
Bu düzeltmeden önceki klipler `review/relationships-before-mirror-fix/` içindedir.

Kullanıcının dinlenme/dönüş ekran görüntülerinde bildirdiği uzama yeniden üretildi.
Eski courier yüzeyinin orta yatay çizgisinin kamera öncesi 2D yay uzunluğu,
256 parçada ölçüldüğünde 243.36'dan 335.80'e çıkıyordu (curl=0.49; +%37.98).
Bu bir 3D malzeme strain ölçümü değil, görünür uzamanın ölçüsüdür.

Kök neden: PageSurface normalize curl koordinatlarını küçük, eğri 2D sınırlar
üzerine yerleştiriyor; ardından boyuttan bağımsız varsayılan lift [-60,-780,-.2]
ve perspektif paydası uyguluyordu. Normalize curl'ün kendi metriğini koruması,
bu sonraki dönüşümlerin küçük yüzeyde uzunluk koruduğu anlamına gelmiyor.
Önceki finite/bounding-box denetimi ve görsel inceleme bu kusuru kaçırdı.

Laboratuvar `engine/inextensible-sheet.mjs` kullanır: silindirik bükülmede yay
koordinatı doğrudan kâğıdın gerçek eninden alınır. 3D teğetler birim uzunlukta
ve birbirine diktir. Menteşe sabit kalır. Kamera öncesi projeksiyon ortografiktir;
segmentleri büyütemez. Dönüşte görünen siluet değişebilir ama malzeme uzamaz.
Bu sürüm homojen silindirik bükülmedir; tam kâğıt fiziği simülasyonu değildir.

Yeni denetim 3D en/boy/çapraz uzunluk farklarını %0.1 sınırıyla ölçer. Kutunun
içinde kalan %2 yüzey uzaması da ayrı testte reddedilir. Dört farklı en/boyda,
241 dönüş örneği ve projected segment sınırları birim testine eklendi.

Önceki klipler `review/relationships-before-stretch-fix/` içinde korunur.
22 test ve tüm laboratuvar/Galileo kontrolleri geçti. Yeni üç klibin tamamı
decode edildi; 15 Hz kâğıt yakın plan şeritlerinin tümü açılıp incelendi.
Önceki uzayan uç görünümü gözlenmedi. İnsan onayı henüz verilmedi.
`review/relationships/comparison/before-after.mp4`: sol eski, sağ yeni.
Yeni kanıt `review/relationships/` içindedir. Galileo'nun mevcut PageSurface
geçişi ve sanatı değiştirilmedi; onun stilize projeksiyonuna bu yeni fiziksel
sözleşmenin geçtiği iddia edilmez. Bu düzeltmenin kapsamı bağımsız laboratuvardır.
