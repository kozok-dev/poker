import{P as l}from"./index-f699a78a.js";let i;async function a(){i=await l.loadImages(["player2-1.jpg","player2-2.jpg","player2-3.jpg"])}function s(){return{image:i["player2-1.jpg"].src,description:"ポーカーフェイスの欠片もなく、すぐ表情に出る。"}}class p{getImage(e){if(e.action==l.ACTION.BANKRUPT)return i["player2-3.jpg"].src;if(e.result==l.RESULT.WIN)return i["player2-2.jpg"].src;if(e.result==l.RESULT.LOSE)return i[e.betTotal>1?"player2-3.jpg":"player2-1.jpg"].src;if(e.action==l.ACTION.FOLD)return i[e.betTotal<4?"player2-1.jpg":"player2-3.jpg"].src;if(e.hand!=null){if(e.hand.type>=l.HAND.TWO_PAIR)return i["player2-2.jpg"].src;if(e.betTotal>3&&e.hand.type==l.HAND.NO_PAIR)return i["player2-3.jpg"].src}return i["player2-1.jpg"].src}getBet(e,u,o){if(e.hand.type<l.HAND.TWO_PAIR){if(o>=3&&e.hand.type==l.HAND.NO_PAIR||Math.random()<.05)return-1}else return 5;return Math.floor(Math.random()*6)}getChangeCards(e){let u=!1,o=0;for(let t=0;t<3;t++)e[t].number+1==e[t+1].number&&e[t].number+2==e[t+2].number&&(e[t].isHold=!0,e[t+1].isHold=!0,e[t+2].isHold=!0,o++);if(o==1&&Math.random()<.1)u=!0;else if(o>=2)u=!0;else for(let t of e)t.isHold=!1;if(!u){let t=null;for(let r of e)r.isHold||(t!=null&&r.number==t.number&&(r.isHold=!0,t.isHold=!0,u=!0),t=r)}if(!u){let t=null;const r={};for(let n of e)r[n.suit]==null&&(r[n.suit]=0),r[n.suit]++,r[n.suit]>=3&&(t=n.suit);if(t!=null&&(r[t]>=4||Math.random()<.1))for(let n of e)n.suit==t&&(n.isHold=!0)}const f=[];for(let t of e)t.isHold||f.push(t);return f}}const m={loadImages:a,getProfile:s,ComPlayer:p};export{m as default};