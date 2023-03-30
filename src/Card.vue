<script>
const NUMBER_LABEL = Object.freeze({2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 14: "A"});
const SUIT_LABEL = Object.freeze({1: "♣", 2: "♦", 3: "♥", 4: "♠"});

const cards = [];

// カード初期化
function init() {
	cards.splice(0, cards.length);

	for (let number = 2; number <= 14; number++) {
		for (let suit = 1; suit <= 4; suit++) {
			cards.push({number, suit});
		}
	}
}

// カードを取る
function draw() {
	if (cards.length == 0) return null;

	const index = Math.floor(Math.random() * cards.length);
	const card = cards[index];
	cards.splice(index, 1);
	return card;
}

// カードを追加
function add(card) {
	cards.push(card);
}

export default {init, draw, add};
</script>

<script setup>
import { useOptionStore } from "./store";

const props = defineProps({
	number: Number,
	suit: Number,
	isBack: Boolean
});

const store = useOptionStore();
</script>

<template>
	<div class="card" :class="{
		black: !props.isBack && (props.suit == 1 || props.suit == 4),
		red: !props.isBack && (props.suit == 2 || props.suit == 3),
		back: props.isBack,
		gradient: store.useGradient
	}">
		<div class="number">{{ props.isBack ? "" : NUMBER_LABEL[props.number] }}</div>
		<div class="suit">{{ props.isBack ? "" : SUIT_LABEL[props.suit] }}</div>
	</div>
</template>

<style scoped>
.card {
	position: relative;
	width: 20%;
	height: 6em;
	margin: 0.2em;
	background: #fff;
	border-radius: 0.2em;
	font-weight: bold;
	text-align: center;
	cursor: default;
}
@media (orientation: landscape) {
	.player:not(:last-child) .card {
		font-size: 70%;
	}
}
@media (orientation: portrait) {
	.player-container.player5 .player:not(:last-child) .card {
		font-size: 85%;
	}
	.player-container.player6 .player:not(:last-child) .card {
		font-size: 90%;
	}
	.player-container.player7 .player:not(:last-child) .card {
		font-size: 80%;
	}
}
.card.gradient {
	background: radial-gradient(#fff 50%, #ddd);
	filter: drop-shadow(0 0 0.1em rgba(0, 0, 0, 0.5));
}

.black {
	color: #000;
}
.red {
	color: #900;
}
.back::after {
	position: absolute;
	left: 0;
	top: 0;
	width: calc(100% - 0.8em);
	height: calc(100% - 0.8em);
	margin: 0.4em;
	background: #bdf;
	border: 0.1em solid #57b;
	border-radius: 0.2em;
	box-sizing: border-box;
	content: " ";
}
.back.gradient::after {
	background: radial-gradient(#bdf 50%, #ace);
}

.number {
	position: relative;
	top: 0.2em;
	font-size: 150%;
}
.suit {
	font-size: 250%;
}
</style>
