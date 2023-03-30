<script>
window.addEventListener("resize", () => {
	document.documentElement.style.setProperty("--vh", `${window.innerHeight}px`);
});
window.dispatchEvent(new Event("resize"));

document.addEventListener("contextmenu", (event) => {
	event.preventDefault();
});
</script>

<script setup>
import { ref, onMounted } from "vue";
import { useOptionStore } from "./store";
import Sound from "./sound";
import Title from "./Title.vue";
import Game from "./Game.vue";
import Player from "./Player.vue";
import PushButton from "./PushButton.vue";
import ModalHowTo from "./ModalHowTo.vue";
import ModalOption from "./ModalOption.vue";
import ModalConfirmEnd from "./ModalConfirmEnd.vue";

const store = useOptionStore();

const isTitle = ref(false);
const isGame = ref(false);
const buttonEndDisabled = ref(true);
const isApp = ref(true);
const test = ref();

const modalHowTo = ref();
const modalOption = ref();
const modalConfirmEnd = ref();

const comPlayerInfos = [];
let option = {};

onMounted(async () => {
	// CSS有効監視
	const observer = new IntersectionObserver(entry => {
		if (entry[0].isIntersecting) isApp.value = false;
	});
	observer.observe(test.value);

	const promises = [];

	promises.push(Player.loadDefaultImage());

	// コンピュータープレイヤー読み込み
	for (let i = 1; i <= 6; i++) {
		promises.push((async () => {
			const comPlayer = (await import(`./ComPlayer${i}.js`)).default;
			await comPlayer.loadImages();
			comPlayerInfos[i - 1] = comPlayer;
		})());
	}

	// 音声読み込み
	promises.push(Sound.load());

	await Promise.all(promises);

	onTitle();
});

function onTitle() {
	isTitle.value = true;
	isGame.value = false;
	buttonEndDisabled.value = true;
}

function onGame(_option) {
	option = _option;
	isTitle.value = false;
	isGame.value = true;
	buttonEndDisabled.value = false;
}
</script>

<template>
	<div id="test" ref="test"><div v-if="!isApp">Error</div></div>
	<div class="app" :class="{gradient: store.useGradient}" v-if="isApp">
		<h1 class="title">
			<div>Draw Poker</div>
			<div class="button-container">
				<PushButton class="button" @push="modalHowTo.show()">遊び方</PushButton>
				<PushButton class="button" @push="modalOption.show()">設定</PushButton>
				<PushButton class="button" @push="modalConfirmEnd.show()" :disabled="buttonEndDisabled">ゲーム終了</PushButton>
			</div>
		</h1>

		<Transition mode="out-in">
			<Title v-if="isTitle" @game-start="onGame" :com-player-infos="comPlayerInfos" />
			<Game v-else-if="isGame" @game-end="onTitle" :com-player-infos="comPlayerInfos" :player-count="option.playerCount" :com-players="option.comPlayers" />
			<div v-else class="loading">
				<svg viewBox ="0 0 200 200">
					<path d="M 60 169 a 80 80 0 1 1 80 0" fill="none" stroke="#fff" stroke-width="20" />
				</svg>
			</div>
		</Transition>

		<ModalHowTo ref="modalHowTo" />
		<ModalOption ref="modalOption" />
		<ModalConfirmEnd ref="modalConfirmEnd" @yes="onTitle" />
	</div>
</template>

<style>
:root {
	--vh: 100vh;
	--font-size: max(640px / 60, min(var(--vh) / 9 * 16 / 60, 100vw / 60));
}
@media (orientation: portrait) {
	:root {
		--font-size: max(360px / 30, min(var(--vh) / 16 * 9 / 30, 100vw / 30));
	}
}

body {
	margin: 0;
	color: #fff;
	background-color: #ddc;
	font-size: var(--font-size);
	font-family: sans-serif;
	user-select: none;
	-webkit-user-select: none;
	touch-action: manipulation;
}
</style>

<style scoped>
.app {
	position: absolute;
	width: calc(var(--vh) / 9 * 16);
	min-width: 640px;
	max-width: 100vw;
	height: calc(100vw / 16 * 9);
	min-height: 360px;
	max-height: var(--vh);
	margin: auto;
	padding: 0.5em;
	background: #263;
	box-sizing: border-box;
	overflow: auto;
}
@media (orientation: portrait) {
	.app {
		width: calc(var(--vh) / 16 * 9);
		min-width: 360px;
		height: calc(100vw / 9 * 16);
		min-height: 640px;
	}
}
@media (orientation: landscape) and (min-width: 640px), (orientation: portrait) and (min-width: 360px) {
	.app {
		left: 0;
		right: 0;
	}
}
@media (orientation: landscape) and (min-height: 360px), (orientation: portrait) and (min-height: 640px) {
	.app {
		top: 0;
		bottom: 0;
	}
}
.app.gradient {
	background: linear-gradient(135deg, #263, #152);
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.7));
}

.title {
	width: 100%;
	margin: 0 0 0.3em 0;
	padding: 0 0.3em;
	background-color: #964;
	border-top: 1px solid #c97;
	border-bottom: 1px solid #641;
	font-size: 120%;
	box-sizing: border-box;
	display: flex;
	justify-content: space-between;
}

.button-container {
	display: flex;
	align-items: center;
}
.button {
	margin-left: 1em;
	padding: 0.2em 0.5em;
	color: #fff;
	background-color: #a75;
	font-size: 50%;
}
.button[disabled] {
	opacity: 0.5;
}
.button:not([disabled]):hover {
	background-color: #b86;
}
.button:not([disabled]):active {
	background-color: #b86;
}

.v-enter-active, .v-leave-active {
	transition: opacity 0.2s;
}
.v-enter-from, .v-leave-to {
	opacity: 0;
}

.loading {
	position: relative;
	width: 10%;
	height: 90%;
	margin: auto;
}
@media (orientation: portrait) {
	.loading {
		width: 20%;
	}
}
.loading svg {
	position: absolute;
	top: 0;
	bottom: 0;
	margin: auto;
	animation: loading-anim 1.5s linear infinite;
}
@keyframes loading-anim {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

#test {
	position: absolute;
	top: -99px;
	color: #000;
}
</style>
