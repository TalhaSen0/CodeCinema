import {PageSurface} from '../../engine/page-surface.mjs';
import {CLIPS} from './production.mjs';
export {CLIPS} from './production.mjs';
import {ease,mix} from '../../engine/math.mjs';
export const BOOK_ORIGIN=[1025,847];
// Exactly the existing approved book's Bézier boundary controls; one source.
export const RIGHT_PAGE={top:[[-8,-29],[116,-76],[277,-34]],bottom:[[6,40],[132,-20],[282,14]]};
export const LEFT_PAGE={top:[[-278,-18],[-129,-67],[-8,-29]],bottom:[[-281,25],[-139,2],[6,40]]};
export const pageSurface=new PageSurface({id:'galileo-right-page',origin:BOOK_ORIGIN,...RIGHT_PAGE,turned:{top:[...LEFT_PAGE.top].reverse(),bottom:[...LEFT_PAGE.bottom].reverse()}});
export const leftSurface=new PageSurface({id:'galileo-left-page',origin:BOOK_ORIGIN,...LEFT_PAGE});
export function bookCamera(t,closing=false){const z=closing?mix(1.12,1.04,ease(t,43,48)):1.02+t*.006;return[z,0,960*(1-z),0,z,530*(1-z),0,0,1]}
export function pageView(t){if(t<10)return pageSurface.view(0,bookCamera(t));if(t<14)return pageSurface.view(ease(t,...CLIPS.entry),bookCamera(t));if(t<41)return pageSurface.view(1);if(t<44)return pageSurface.view(1-ease(t,...CLIPS.exit),bookCamera(t,true));return pageSurface.view(0,bookCamera(t,true))}
export function pageStateAt(t){if(t<4.7)return{under:'galileo',front:'notes',time:14,curl:0};if(t<6.9)return{under:'galileo',front:'notes',time:14,curl:ease(t,...CLIPS.firstTurn)};if(t<24)return{under:'galileo',front:'galileo',time:t<14?14:t,curl:0};if(t<28.5)return{under:'bernoulli',front:'galileo',time:23.9,curl:ease(t,...CLIPS.chapterTurn)};return{under:'bernoulli',front:'bernoulli',time:t<29?29:Math.min(t,41),curl:0}}
