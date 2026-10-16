export const DURATION=48;
export const CLIPS={firstTurn:[4.7,6.9],entry:[10,14],chapterTurn:[24,28.5],exit:[41,44]};
export const narration=[
 {start:0.8,end:7.9,text:'Bin altı yüz otuz sekiz. Galileo’nun hareket üzerine çalışmaları yayımlanır. En kısa yol, en hızlı yol mudur?'},
 {start:9,end:14.2,text:'Aynı iki nokta arasında, düz bir rampa en kısa mesafeyi sunar.'},
 {start:15,end:22.8,text:'Ama daha dik başlayan bir eğri, cismi önce hızlandırır. Galileo dairesel yayları incelemişti.'},
 {start:24.8,end:32.7,text:'Bin altı yüz doksan altıda Johann Bernoulli soruyu yeniden ortaya koydu. Ertesi yıl, çözümler yayımlandı.'},
 {start:33.2,end:40.9,text:'İdeal koşullarda en hızlı iniş yolu, bir sikloiddir. Başta kazanılan hız, uzun yolu telafi eder.'},
 {start:42.2,end:47.2,text:'Bilim bazen mesafeyi değil, doğru soruyu kısaltır.'}
];
export const shots=[
 {start:0,end:10,name:'Mum ışığında soru',goal:'Galileo, kütüphane, el ve sayfa etkileşimi; sakin yaklaşma'},
 {start:10,end:14,name:'Kitabın içine',goal:'Kitaptaki çizim tam ekran parşömene dönüşür'},
 {start:14,end:24,name:'Mesafe ve zaman',goal:'Ortak A/B arasında doğru parçası ve dairesel yay; sürtünmesiz kayma'},
 {start:24,end:29,name:'Bir sayfa, elli sekiz yıl',goal:'Fizik çizimi sayfa dönüşüyle 1696–1697 tarihine bağlanır'},
 {start:29,end:41,name:'Sikloid',goal:'Sikloidin oluşumu, üç eşzamanlı bırakılma ve hesaplanan varış süreleri'},
 {start:41,end:44,name:'Mürekkebe dönüş',goal:'Canlı çizim kitaptaki sabit diyagrama geri yerleşir'},
 {start:44,end:48,name:'Soru kalır',goal:'Aynı oda ve karakter, kameranın yavaş geri çekilişi, kapanış'}
];
export const events=[{t:4.7,type:'page'},{t:10,type:'reveal'},{t:17.5,type:'release'},{t:24.5,type:'page'},{t:29,type:'reveal'},{t:34,type:'release'},{t:41,type:'page'}];
