<script>
const ACTION = Object.freeze({
	BANKRUPT: 0,
	FOLD: 1,
	CHECK: 2,
	CALL: 3,
	BET: 4,
	RAISE: 5,
	ALL_IN: 6
});
const ACTION_LABEL = Object.freeze({
	[ACTION.BANKRUPT]: "破産",
	[ACTION.FOLD]: "フォールド",
	[ACTION.CHECK]: "チェック",
	[ACTION.CALL]: "コール",
	[ACTION.BET]: "ベット",
	[ACTION.RAISE]: "レイズ",
	[ACTION.ALL_IN]: "オールイン"
});

const RESULT = Object.freeze({
	WIN: 1,
	LOSE: 2,
	DRAW: 3
});
const RESULT_LABEL = Object.freeze({
	[RESULT.WIN]: "勝ち",
	[RESULT.LOSE]: "負け",
	[RESULT.DRAW]: "引き分け"
});

const HAND = Object.freeze({
	NO_PAIR: 1,
	ONE_PAIR: 2,
	TWO_PAIR: 3,
	THREE_OF_A_KIND: 4,
	STRAIGHT: 5,
	FLUSH: 6,
	FULL_HOUSE: 7,
	FOUR_OF_A_KIND: 8,
	STRAIGHT_FLUSH: 9,
	ROYAL_FLUSH: 10
});
const HAND_LABEL = Object.freeze({
	[HAND.NO_PAIR]: "ノーペア",
	[HAND.ONE_PAIR]: "ワンペア",
	[HAND.TWO_PAIR]: "ツーペア",
	[HAND.THREE_OF_A_KIND]: "スリーカード",
	[HAND.STRAIGHT]: "ストレート",
	[HAND.FLUSH]: "フラッシュ",
	[HAND.FULL_HOUSE]: "フルハウス",
	[HAND.FOUR_OF_A_KIND]: "フォーカード",
	[HAND.STRAIGHT_FLUSH]: "ストレートフラッシュ",
	[HAND.ROYAL_FLUSH]: "ロイヤルストレートフラッシュ"
});

// 画像読み込み
async function loadImages(fileNames) {
	const images = {};

	const promises = [];
	for (let fileName of fileNames) {
		promises.push(new Promise(resolve => {
			const image = new Image();
			image.addEventListener("load", resolve);
			image.src = fileName;
			images[fileName] = image;
		}));
	}

	await Promise.all(promises);
	return images;
}

let defaultImage = [];
async function loadDefaultImage() {
	defaultImage[0] = (await loadImages(["player.png"]))["player.png"];
}

function countSequence(cards) {
	let sequenceCount = 0;
	for (let i = 0; i < 3; i++) {
		if (cards[i].number + 1 == cards[i + 1].number && cards[i].number + 2 == cards[i + 2].number) {
			sequenceCount++;
		}
	}
	if (sequenceCount == 1) return 3;
	if (sequenceCount == 2) return 4;
	if (sequenceCount == 3) return 5;
	return 0;
}

function countSuit(cards) {
	let suit = null;
	const suitCount = {};
	for (let card of cards) {
		if (suitCount[card.suit] == null) suitCount[card.suit] = 0;
		suitCount[card.suit]++;
		if (suitCount[card.suit] >= 3) suit = card.suit;
	}
	return suit == null ? 0 : suitCount[suit];
}

export default {ACTION, RESULT, HAND, loadImages, defaultImage, loadDefaultImage, countSequence, countSuit};
</script>

<script setup>
import { ref, watch, onMounted } from "vue";
import anime from "animejs";
import Sound from "./sound";
import Card from "./Card.vue";

const image = ref(null);
const chip = ref(0);
const isDealer = ref(false);
const cards = ref((() => {
	const data = [];
	for (let i = 0; i < 5; i++) {
		data.push({
			number: null,
			suit: null,
			isBack: true,
			isSelected: false,
			style: {}
		});
	}
	return data;
})());
const selectableCard = ref(false);
const action = ref(null);
const bet = ref(0);
const betTotal = ref(0);
const result = ref(null);
const hand = ref(null);

// アクション設定
const actionView = ref(action.value);
const actionRef = ref();
let actionAnime = null;
onMounted(() => {
	actionRef.value.style.display = "none";
});
async function setAction(_action) {
	if (action.value == ACTION.BANKRUPT) return;

	action.value = _action;

	if (actionAnime != null) actionAnime.remove(actionRef.value);

	if (action.value == null) {
		// アクション非表示
		actionAnime = anime({
			targets: actionRef.value,
			opacity: 0,
			duration: 200,
			easing: "easeOutCubic",
			complete() {
				actionView.value = action.value;
				actionRef.value.style.display = "none";
			}
		});
	} else {
		// アクション表示
		actionView.value = action.value;
		actionRef.value.style.display = null;
		actionRef.value.style.opacity = 0;
		actionAnime = anime({
			targets: actionRef.value,
			opacity: 1,
			duration: 200,
			easing: "easeOutCubic",
			complete() {
				actionRef.value.style.opacity = null;
			}
		});

		switch (action.value) {
		case ACTION.FOLD:
			Sound.play("fold");
			break;
		case ACTION.CHECK:
			Sound.play("check");
			break;
		case ACTION.CALL:
		case ACTION.BET:
			Sound.play("bet");
			break;
		case ACTION.RAISE:
		case ACTION.ALL_IN:
			Sound.play("raise");
			break;
		}
	}

	await actionAnime.finished;
}

// カード並べ替え
// ※TransitionGroupだと他のアニメーションの絡みでうまく動かないので使用しない。このため、並べ替えアニメーションを自前実装する
const cardsRef = ref();
async function sortCards() {
	const beforeCards = cards.value.map(card => ({number: card.number, suit: card.suit}));

	sortCardsImmediate(cards.value);

	// 並べ替え前後で変化しているカードをアニメーションさせる
	const promises = [];
	let count = 0;
	for (let i = 0; i < cards.value.length; i++) {
		let j;

		let isChanged = false;
		for (j = 0; j < beforeCards.length; j++) {
			if (cards.value[i].number != beforeCards[j].number || cards.value[i].suit != beforeCards[j].suit) continue;
			if (i == j) continue;
			isChanged = true;
			break;
		}
		if (!isChanged) continue;	// 変化していなければ何もしない

		// 並べ替え後の位置情報
		let rect = cardsRef.value[i].$el.getBoundingClientRect();
		let rectParent = cardsRef.value[i].$el.parentElement.getBoundingClientRect();
		const left = rect.left - parseFloat(getComputedStyle(cardsRef.value[i].$el).marginLeft) - rectParent.left;
		const top = rect.top - parseFloat(getComputedStyle(cardsRef.value[i].$el).marginTop) - rectParent.top;

		// 並べ替え前の位置情報
		rect = cardsRef.value[j].$el.getBoundingClientRect();
		rectParent = cardsRef.value[j].$el.parentElement.getBoundingClientRect();
		const leftBefore = rect.left - parseFloat(getComputedStyle(cardsRef.value[j].$el).marginLeft) - rectParent.left;
		const topBefore = rect.top - parseFloat(getComputedStyle(cardsRef.value[j].$el).marginTop) - rectParent.top;

		// 内部的には既に並べ替え後の状態になっているので並べ替え前の位置で表示して、元に戻すアニメーションをすることで並べ替え演出を行う
		cards.value[i].style.transform = `translate(${leftBefore - left}px, ${topBefore - top}px)`;

		promises.push(anime({
			targets: cards.value[i].style,
			transform: "translate(0px, 0px)",
			delay: count++ * 50,
			duration: 500,
			easing: "easeOutCubic",
			complete() {
				cards.value[i].style.transform = null;
			}
		}).finished);
	}

	if (promises.length > 0) Sound.play("card1");

	await Promise.all(promises);
}

// カード並べ替え(アニメーションなし)
function sortCardsImmediate(_cards) {
	const isWeakAce = isWeakStraight(_cards);

	_cards.sort((a, b) => {
		const aNumber = isWeakAce && a.number == 14 ? 1 : a.number;
		const bNumber = isWeakAce && b.number == 14 ? 1 : b.number;

		if (aNumber < bNumber) {
			return -1;
		} else if (aNumber > bNumber) {
			return 1;
		} else if (a.suit < b.suit) {
			return -1;
		} else if (a.suit > b.suit) {
			return 1;
		} else {
			return 0;
		}
	});
}

// 最弱数字のストレートかどうか
function isWeakStraight(_cards) {
	for (let number of [2, 3, 4, 5, 14]) {
		if (_cards.findIndex(card => card.number == number) != -1) continue;
		return false;
	}
	return true;
}

// カード選択
for (let i = 0; i < 5; i++) {
	const card = cards.value[i];

	watch(() => card.isSelected, () => {
		if (!selectableCard.value) return;

		if (card.style.transform == null) card.style.transform = "translateY(0em)";

		if (card.isSelected) {
			anime({
				targets: card.style,
				transform: "translateY(-1em)",
				duration: 200,
				easing: "easeOutCubic"
			});
		} else {
			anime({
				targets: card.style,
				transform: "translateY(0em)",
				duration: 200,
				easing: "easeOutCubic",
				complete() {
					card.style.transform = null;
				}
			});
		}

		Sound.play("card1");
	});
}

// カード選択可能
watch(() => selectableCard.value, () => {
	for (let card of cards.value) {
		card.style.cursor = selectableCard.value ? "pointer" : null;
	}
});

// カード交換
async function changeCard(index, newCard, isBack) {
	const card = cards.value[index];

	if (card.style.transform == null) card.style.transform = "translateY(0em)";

	card.style.opacity = 1;
	await anime({
		targets: card.style,
		opacity: 0,
		transform: "translateY(-2em)",
		duration: 200,
		easing: "easeOutCubic",
	}).finished;

	if (newCard == null) {
		card.number = null;
		card.suit = null;
		card.isBack = true;
		return;
	}

	card.number = newCard.number;
	card.suit = newCard.suit;
	if (isBack != null) card.isBack = isBack;

	await anime({
		targets: card.style,
		opacity: 1,
		transform: "translateY(0em)",
		duration: 200,
		easing: "easeOutCubic",
	}).finished;

	card.style.opacity = null;
	card.style.transform = null;
}

// カードの表裏を反転する
async function toggleCards() {
	const promises = [];
	for (let card of cards.value) {
		promises.push((async () => {
			if (card.style.transform == null) card.style.transform = "rotateY(0deg)";

			await anime({
				targets: card.style,
				opacity: 0,
				transform: "rotateY(89deg)",
				duration: 500,
				easing: "easeOutCubic",
			}).finished;

			card.isBack = !card.isBack;

			await anime({
				targets: card.style,
				opacity: 1,
				transform: "rotateY(0deg)",
				duration: 500,
				easing: "easeOutCubic",
			}).finished;

			card.style.transform = null;
		})());
	}

	await Promise.all(promises);
}

// 手札の役を{type, details}形式で取得
// type：役
// details：手札を強い順にした配列
//          性質上、ノーペアやストレート、フラッシュ等の数字が全て異なる役は5件
//          フォーカード、フルハウスは2件、スリーカード、ツーペアは3件、ワンペアは4件
function getHand() {
	const _cards = cards.value.map(card => ({number: card.number, suit: card.suit}));

	sortCardsImmediate(_cards);
	// 最弱数字のストレートなら1番目がA(14)になっているはずなのでA(1)にする
	if (isWeakStraight(_cards)) _cards[0].number = 1;

	let type;
	const details = [];
	let sequenceCount = 0;
	let suitCount = 0;

	let beforeCard = null;
	for (let card of _cards) {
		// 同じ数字の数、スートの最大値
		let pairIndex = details.findIndex(detail => detail.number == card.number);
		if (pairIndex == -1) {
			details.push({number: card.number, count: 1, suitMax: card.suit});
		} else {
			details[pairIndex].count++;
			if (details[pairIndex].suitMax < card.suit) details[pairIndex].suitMax = card.suit;
		}

		// 連番、同一スート
		if (beforeCard == null || card.number == beforeCard.number + 1) sequenceCount++;
		if (beforeCard == null || card.suit == beforeCard.suit) suitCount++;
		beforeCard = card;
	}

	// 強い順に並べ替え
	details.sort((a, b) => {
		if (a.count < b.count) {
			return 1;
		} else if (a.count > b.count) {
			return -1;
		} else if (a.number < b.number) {
			return 1;
		} else {
			// 同一の数字は集約されているのと、同じ数字で複数のスートはないのでこれ以上の比較は不要
			return -1;
		}
	});

	if (sequenceCount == 5 && suitCount == 5) {
		type = details[0].number == 14 ? HAND.ROYAL_FLUSH : HAND.STRAIGHT_FLUSH;
	} else if (sequenceCount == 5) {
		type = HAND.STRAIGHT;
	} else if (suitCount == 5) {
		type = HAND.FLUSH;
	} else if (details[0].count == 4) {
		type = HAND.FOUR_OF_A_KIND;
	} else if (details[0].count == 3) {
		type = details[1].count == 2 ? HAND.FULL_HOUSE : HAND.THREE_OF_A_KIND;
	} else if (details[0].count == 2) {
		type = details[1].count == 2 ? HAND.TWO_PAIR : HAND.ONE_PAIR;
	} else {
		type = HAND.NO_PAIR;
	}

	return {type, details};
}

// 参加している(破産でもフォールドでもない)か
function isActive() {
	return action.value != ACTION.BANKRUPT && action.value != ACTION.FOLD;
}

defineExpose({
	image,
	chip,
	isDealer,
	cards,
	selectableCard,
	action,
	bet,
	betTotal,
	result,
	hand,
	setAction,
	sortCards,
	sortCardsImmediate,
	isWeakStraight,
	changeCard,
	toggleCards,
	getHand,
	isActive
});
</script>

<template>
	<div class="player">
		<div class="info" :class="{dealer: isDealer}">
			<div class="image">
				<img :src="image">
			</div>
			<div class="chip">{{ chip }}枚<span class="betTotal" v-show="betTotal > 0">+{{ betTotal }}</span></div>
		</div>

		<div class="card-container">
			<Card v-for="card in cards"
				:number="card.number"
				:suit="card.suit"
				:is-back="card.isBack"
				:style="card.style"
				@click="if (selectableCard) { card.isSelected = !card.isSelected; }"
				ref="cardsRef"
			/>

			<div class="action" ref="actionRef">
				{{ ACTION_LABEL[actionView] }}
				{{ actionView == 4 || actionView == 5 ? `(${bet}枚)` : "" }}
			</div>
		</div>

		<div class="result-container" :class="{win: result == 1}" :style="{visibility: result == null ? 'hidden' : null}">
			<div class="result">{{ result == null ? "" : RESULT_LABEL[result] }}</div>
			<div>{{ hand == null ? "" : HAND_LABEL[hand.type] }}</div>
		</div>
	</div>
</template>

<style scoped>
/* プレイヤー */
.player {
	width: 32%;
	margin: 1em 0;
	padding-top: 0.1em;
	background-color: #274;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
}
@media (orientation: landscape) {
	.player:last-child {
		width: 50%;
		margin-left: auto;
		margin-right: auto;
	}

	.player-container.player5 .player:not(:last-child) {
		width: 35%;
		margin: 0.2em 0;
	}
	.player-container.player6 .player:not(:last-child),
	.player-container.player7 .player:not(:last-child) {
		margin: 0.2em 0;
	}
}
@media (orientation: portrait) {
	.player {
		width: 100%;
	}

	.player-container.player5 .player:not(:last-child) {
		margin: 0.3em 0;
	}
	.player-container.player6 .player:not(:last-child) {
		margin: 0.3em 0;
		font-size: 80%;
	}
	.player-container.player7 .player:not(:last-child) {
		margin: 0.3em 0;
		font-size: 70%;
	}

	.player-container.player6 .player:not(:last-child) .action,
	.player-container.player7 .player:not(:last-child) .action {
		font-size: 120%;
	}

	.player-container.player7 .player:not(:last-child) .image {
		width: 60%;
	}
}

/* プレイヤー情報 */
.info {
	position: relative;
	width: 20%;
	margin-top: 0.2em;
}
@media (orientation: portrait) {
	.info {
		width: 15%;
	}
}
.image {
	width: 70%;
	margin: 0 auto;
}
.image img {
	width: 100%;
	border-radius: 5%;
	display: block;
}
.chip {
	margin-top: 0.3em;
	text-align: center;
	white-space: nowrap;
}
@media (orientation: landscape) {
	.player:not(:last-child) .chip {
		font-size: 70%;
	}
}
@media (orientation: portrait) {
	.player .chip {
		font-size: 80%;
	}

	.player-container.player6 .player:not(:last-child) .chip,
	.player-container.player7 .player:not(:last-child) .chip {
		font-size: 100%;
	}
}
.betTotal {
	color: #ef9;
	font-size: 80%;
	vertical-align: middle;
}
.dealer::after {
	position: absolute;
	left: 50%;
	bottom: -2.7em;
	padding: 0.5em;
	color: #ffa;
	background-color: rgba(100, 200, 100, 0.5);
	font-size: 60%;
	border-radius: 50%;
	transform: translateX(-50%);
	content: 'DEALER';
}

/* カード */
.card-container {
	position: relative;
	width: 80%;
	display: flex;
}
@media (orientation: portrait) {
	.card_container {
		width: 85%;
	}
}

/* アクション */
.action {
	position: absolute;
	left: 0;
	top: 50%;
	width: 100%;
	padding: 0.7em 0;
	color: #df7;
	background-color: rgba(0, 50, 20, 0.8);
	font-weight: bold;
	text-align: center;
	word-break: break-all;
	transform: translateY(-50%);
}

/* 結果 */
.result-container {
	width: 100%;
	height: 1.5em;
	color: #7ce;
	background-color: #555;
	font-size: 70%;
	font-weight: bold;
	display: flex;
}
@media (orientation: landscape) {
	.player:last-child .result-container {
		font-size: 100%;
	}
}
@media (orientation: portrait) {
	.result-container {
		font-size: 100%;
	}
}
.result {
	width: 20%;
	margin-left: 20%;
}
@media (orientation: portrait) {
	.result {
		margin-left: 15%;
	}
}
.win {
	color: #fc4;
	background-image: linear-gradient(90deg, #500, #a55, #500);
	background-size: 200%;
	animation: win-anim 1s ease-in-out infinite;
}
@keyframes win-anim {
	0% {
		background-position-x: 200%;
	}
	100% {
		background-position-x: 0%;
	}
}
</style>
