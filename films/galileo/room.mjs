import {ctx,path,ellipse,line,rect,grad,glow,text,hatch,layer} from '../../engine/paint.mjs';
import {rng,ease} from '../../engine/math.mjs';
import {rig,drawHands} from './character.mjs';
import {wristWorld} from './motion.mjs';
import {BOOK_ORIGIN,RIGHT_PAGE} from './pages.mjs';
let background;
function scenery(){
 rect(0,0,1920,1080,grad(0,0,1500,1050,[[0,'#101e25'],[.5,'#30322c'],[1,'#151b1c']]));
 // Stone courses with irregular mortar, composed once for stable texture.
 const r=rng(1638);for(let row=0;row<10;row++)for(let col=-1;col<11;col++){const x=col*196+(row%2)*98,y=row*90;rect(x+4,y+3,190,83,`rgba(${80+r()*20},${76+r()*16},${62+r()*12},.18)`);line([[x+4,y+86],[x+190,y+86]],'#090f1366',3);for(let i=0;i<4;i++)line([[x+r()*190,y+r()*83],[x+r()*190,y+r()*83]],'#aba17c0b',1)}
 // Gothic window and blue night garden.
 path('M 170 635 L 170 263 Q 170 120 320 69 Q 470 120 470 263 L 470 635 Z','#0a141a','#111416',28);
 const win=path('M 187 620 L 187 267 Q 187 139 320 92 Q 452 139 452 267 L 452 620 Z',grad(200,100,400,650,[[0,'#213d4b'],[.8,'#547078'],[1,'#172f38']]),'#6b6b54',5);
 ctx.save();ctx.clip(win);ellipse(381,183,31,31,'#d2d0ac');ellipse(392,174,31,31,'#294550');
 for(let i=0;i<60;i++){const x=190+r()*260,y=130+r()*430;ellipse(x,y,1+r(),1,'#ced9ca66')}
 path('M 185 621 Q 250 545 297 585 Q 366 480 453 553 L 460 650 Z','#193338',null);
 for(let i=0;i<8;i++){const x=190+i*38;line([[x,610],[x-10,490+i*8]],'#162d31',6);line([[x-9,520+i*8],[x-30,500+i*8]],'#162d31',3)}
 ctx.restore();line([[320,105],[320,635]],'#111d21',13);line([[181,330],[458,330]],'#111d21',13);line([[181,470],[458,470]],'#111d21',10);
 path('M 141 644 L 493 644 L 516 670 L 124 670 Z','#65634b','#1b2426',4);
 // Carved timber bookcase.
 rect(1360,65,455,690,'#171b1b');rect(1365,67,440,21,'#4e4030');rect(1363,70,24,695,grad(1360,0,1390,0,[[0,'#1f2423'],[.5,'#5e4c32'],[1,'#211e19']]));rect(1785,70,28,695,'#463a2b');
 const colors=['#67503a','#4b554c','#6a4733','#79715a','#384e50'];
 for(let row=0;row<3;row++){const base=260+row*188;let x=1400;while(x<1770){const w=18+r()*29,h=98+r()*60;ctx.save();ctx.translate(x,base);ctx.rotate((r()-.5)*.12);rect(0,-h,w,h,colors[Math.floor(r()*5)]);rect(2,-h+3,3,h-6,'#a28b582b');for(const y of [-h+12,-h+20,-20,-13])rect(0,y,w,2,'#b39a62aa');line([[w,-h],[w,0]],'#171a17',3);ctx.restore();x+=w+3}rect(1385,base+2,400,15,'#5a4631');rect(1385,base+18,400,8,'#141a1a')}
 // Wall diagram, telescope, hourglass.
 ctx.save();ctx.translate(683,270);ctx.rotate(-.06);rect(-128,-156,256,286,'#332b21');rect(-118,-146,236,266,'#ac996e');ellipse(0,-20,78,78,null,'#4d5a5144',2);ellipse(0,-20,52,52,null,'#4d5a5155',2);line([[-95,-20],[95,-20]],'#665a3c',1);line([[0,-115],[0,78]],'#665a3c',1);text('DE MOTU',0,104,18,'#635132','center');ctx.restore();
 ctx.save();ctx.translate(535,680);ctx.rotate(-.36);rect(-150,-13,275,29,grad(0,-15,0,15,[[0,'#b49b5e'],[.4,'#6e653f'],[1,'#302d24']]));rect(120,-23,40,47,'#817044');rect(-153,-18,28,37,'#292c27');ctx.restore();
 // Chair silhouette with carved finials behind the character.
 path('M 916 776 L 916 503 Q 1064 428 1210 503 L 1210 790 Z','#352b24','#11191b',12);
 for(const x of [916,1210]){line([[x,490],[x,830]],'#6b5033',13);ellipse(x,483,16,21,'#79603e','#25241d',4)}
 rect(0,871,1920,209,grad(0,870,0,1080,[[0,'#443727'],[1,'#111a1c']]));
}
export function book(t=0){
 ctx.save();ctx.translate(...BOOK_ORIGIN);
 ellipse(0,39,305,39,'#050b0b88');
 path('M -284 -10 Q -142 -58 -10 -23 Q 118 -72 281 -27 L 304 40 Q 135 36 8 65 Q -119 35 -294 53 Z','#523122','#170f0e',4);
 for(let i=0;i<8;i++)path(`M -279 ${-9+i*5} Q -142 ${-55+i*5} -8 ${-20+i*6} Q 133 ${-66+i*6} 279 ${-24+i*6}`,null,i%2?'#a78b5a':'#d7c08f',2);
 path('M -278 -18 Q -129 -67 -8 -29 L 6 40 Q -139 2 -281 25 Z',grad(-220,-70,10,35,[[0,'#bba574'],[.5,'#e5d2a3'],[1,'#ac8d58']]),'#85673f',2);
 path(`M ${RIGHT_PAGE.top[0].join(' ')} Q ${RIGHT_PAGE.top[1].join(' ')} ${RIGHT_PAGE.top[2].join(' ')} L ${RIGHT_PAGE.bottom[2].join(' ')} Q ${RIGHT_PAGE.bottom[1].join(' ')} ${RIGHT_PAGE.bottom[0].join(' ')} Z`,grad(0,-30,270,20,[[0,'#8c6c43'],[.15,'#e1c898'],[1,'#c0a46f']]),'#85673f',2);
 for(let i=0;i<10;i++){const y=-18+i*3.4;line([[-240,y],[-160,y-10],[-64,y+5]],'#66583b55',1)}
 ctx.restore();
}
export function roomBase(t,hybrid=false){
 if(!background)background=layer(scenery);ctx.drawImage(background,0,0);
 rig(t,hybrid);
 // Foreground desk occludes lower torso, anchoring the seated weight.
 path('M 382 817 L 1544 817 L 1780 1012 L 133 1012 Z',grad(0,800,0,1030,[[0,'#7c5733'],[.4,'#553c29'],[1,'#382b22']]),'#1d211e',5);
 const r=rng(49);for(let i=0;i<85;i++){const y=829+r()*175;line([[180+r()*250,y],[1000+r()*650,y+Math.sin(i)*6]],i%3?'#c59c5c16':'#160f0d35',1+r()*2)}
 path('M 133 1012 L 1780 1012 L 1780 1054 L 133 1054 Z','#251f1b','#101617',4);
 book(t);
 roomLighting();
}
export function roomForeground(t,hybrid=false){
 drawHands(t);
 // Stacked leather volumes.
 for(let i=0;i<3;i++){const x=1280+i*8,y=866-i*33;path(`M ${x} ${y} L ${x+193} ${y-17} L ${x+219} ${y+3} L ${x+16} ${y+24} Z`,['#354b48','#714a32','#504533'][i],'#24231c',3);path(`M ${x+16} ${y+8} L ${x+216} ${y-9} L ${x+218} ${y+1} L ${x+18} ${y+20} Z`,'#bfa779','#473b26',2);line([[x+37,y+5],[x+35,y+21]],'#b89758',2)}
 // Ink bottle and brass rim.
 ellipse(1180,888,29,11,'#080f1280');path('M 1160 879 L 1157 847 Q 1163 836 1172 836 L 1172 826 L 1190 826 L 1190 837 Q 1206 839 1209 850 L 1207 879 Z','#1c2a2a','#92815c',2);ellipse(1181,826,11,4,'#0c1517','#9f8d61',2);
 // Candle light softly pools across the desk and the character.
 ellipse(688,880,76,17,'#100f0b99');ellipse(688,865,59,12,'#9b733e','#34271b',3);path('M 676 863 L 681 770 L 670 751 L 704 751 L 694 770 L 700 863 Z',grad(670,0,704,0,[[0,'#4c3924'],[.4,'#ba9453'],[1,'#65492a']]),'#36291c',2);ellipse(687,750,42,8,'#ae8b52','#57402a',3);
 path('M 670 750 L 669 653 Q 688 645 705 652 L 706 750 Z',grad(669,0,706,0,[[0,'#bda576'],[.4,'#f2ddb0'],[1,'#bda576']]),'#665033',2);
 path('M 672 655 Q 674 679 679 660 Q 684 647 686 688 Q 694 713 696 668 Q 700 656 704 667',null,'#f0dab1',5);
 line([[687,655],[686,641]],'#35291d',3);
 const flicker=Math.sin(t*8.4)*2+Math.sin(t*17.2)*1.2;
 path(`M 687 645 Q ${663+flicker} 625 ${690+flicker} 595 Q 702 620 696 639 Z`,'#f6bd51',null);path('M 687 642 Q 680 629 690 618 Q 695 635 687 642 Z','#fff4c3',null);
 // Floating dust is analytical, never integrated frame to frame.
 for(let i=0;i<36;i++){const x=565+(i*137.7%700)+Math.sin(t*.27+i)*8,y=260+(i*67.9+t*(3+i%4))%580;ellipse(x,y,1+i%2*.4,1,'#d9ba7c33')}
}

export function room(t,hybrid=false){roomBase(t,hybrid);roomForeground(t,hybrid)}

function roomLighting(){
 ctx.save();ctx.globalCompositeOperation='screen';rect(300,430,1100,600,glow(708,688,630,'#c87c2638'));ctx.restore();
 ctx.save();ctx.globalCompositeOperation='screen';rect(580,530,220,220,glow(688,630,100,'#ffb44770'));ctx.restore();
}
