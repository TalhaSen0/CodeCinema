export const duration=32;
export const title='Salıncağın Sırrı';
export const narration=[
 {start:1.3,end:7.4,text:'İki sarkaç. Aynı başlangıç, farklı ritimler.'},
 {start:9,end:15.5,text:'Kısa olan acele eder. Uzun olan ağırdan alır.'},
 {start:17,end:23.8,text:'Küçük salınımlarda, uzunluk dört katına çıkarsa tur süresi iki katına çıkar.'},
 {start:25,end:30.8,text:'Bazen zamanı değiştirmek için, yalnızca bir ipi uzatmak yeter.'}
];
export const shots=[{start:0,end:8,name:'Gece atölyesi',goal:'Tek sarkaç ve merak'},
 {start:8,end:24,name:'İki ritim',goal:'Ortak ölçek, dört kat uzunluk ve iki kat periyot'},
 {start:24,end:32,name:'Zamanın ölçüsü',goal:'Ritimleri tek kompozisyonda birleştir'}];
export const soundEvents=Array.from({length:50},(_,i)=>({time:8+i*Math.PI*Math.sqrt(.4/9.81)/2,type:'tick'})).filter(e=>e.time<31);
