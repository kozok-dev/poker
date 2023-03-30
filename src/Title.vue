<script setup>
import { ref, onMounted, computed } from "vue";
import { useOptionStore } from "./store";
import Sound from "./sound";
import PushButton from "./PushButton.vue";
import NumberSelect from "./NumberSelect.vue";

const playerCount = computed(() => numberSelect.value.number);
const comPlayers = ref([]);

const store = useOptionStore();

const numberSelect = ref();

const props = defineProps({
	comPlayerInfos: Array
});
const emit = defineEmits(["game-start"]);

onMounted(() => {
	for (let i = 0; i < props.comPlayerInfos.length; i++) comPlayers.value.push(i);

	// シャッフル
	for (let i = comPlayers.value.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[comPlayers.value[i], comPlayers.value[j]] = [comPlayers.value[j], comPlayers.value[i]];
	}

	numberSelect.value.number = store.playerCount;
	numberSelect.value.numberMin = 2;
	numberSelect.value.numberMax = 7;
});

let timer = null;
let eventType = null;

// 前のプレイヤー
function prev(event, index, isContinue) {
	if (eventType != null && eventType != event.type) return;
	eventType = event.type;

	if (comPlayers.value[index] > 0) {
		comPlayers.value[index]--;
	} else {
		comPlayers.value[index] = comPlayers.value.length - 1;
	}

	clearTimer();
	window.addEventListener("pointerup", clearTimer);
	timer = setTimeout(() => {
		prev(event, index, true);
	}, isContinue ? 100 : 200);

	Sound.play("button");
}

// 次のプレイヤー
function next(event, index, isContinue) {
	if (eventType != null && eventType != event.type) return;
	eventType = event.type;

	if (comPlayers.value[index] < comPlayers.value.length - 1) {
		comPlayers.value[index]++;
	} else {
		comPlayers.value[index] = 0;
	}

	clearTimer();
	window.addEventListener("pointerup", clearTimer);
	timer = setTimeout(() => {
		next(event, index, true);
	}, isContinue ? 100 : 200);

	Sound.play("button");
}

function clearTimer() {
	if (timer == null) return;
	clearTimeout(timer);
	timer = null;
	window.removeEventListener("pointerup", clearTimer);
}
</script>

<template>
	<div class="title-container">
		<div class="number-select-container"><NumberSelect ref="numberSelect" @change="store.playerCount = numberSelect.number" />&nbsp;人でプレイ</div>

		<div class="player-select">
			<div class="player-select-title">相手プレイヤー選択</div>
			<div class="player-container">
				<div v-for="(i, index) in comPlayers" class="player" :class="{disabled: index >= playerCount - 1}">
					<div class="prev" @pointerdown="prev($event, index)" @touchstart="prev($event, index)" @touchend="clearTimer"></div>
					<div class="image"><img :src="props.comPlayerInfos[i].getProfile().image"></div>
					<div class="description">{{ props.comPlayerInfos[i].getProfile().description }}</div>
					<div class="next" @pointerdown="next($event, index)" @touchstart="next($event, index)" @touchend="clearTimer"></div>
				</div>
			</div>
		</div>

		<div>
			<PushButton class="button" @push="emit('game-start', {playerCount, comPlayers})">ゲーム開始</PushButton>
		</div>
	</div>
</template>

<style scoped>
.title-container {
	text-align: center;
}

.number-select-container {
	margin: 1em;
}

.player-select {
	width: 90%;
	margin: 1em auto;
	padding: 0.2em 0;
	background-color: #041;
	border-radius: 0.3em;
}
.player-select-title {
	color: #ef9;
}
.player-container {
	margin: auto;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
}
.player {
	position: relative;
	width: 47%;
	margin: 0.2em 0.5em;
	background-color: #274;
	display: flex;
}
@media (orientation: portrait) {
	.player {
		width: 100%;
	}
}
.player.disabled::after {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 60, 10, 0.7);
	content: " ";
}

.image {
	width: 20%;
	height: 5em;
	margin: 0.2em;
	background-color: #152;
	border-radius: 5%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.image img {
	width: 80%;
}
.description {
	width: 50%;
	margin: 0.2em;
	font-size: 90%;
	text-align: left;
	word-break: break-all;
}

.prev {
	width: 15%;
	color: #eee;
	background-color: #5a7;
	font-size: 170%;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
}
.prev::before {
	content: "≪";
}
.prev:hover {
	color: #fff;
	background-color: #6b8;
}
.prev:active {
	color: #fff;
	background-color: #7c9;
}

.next {
	width: 15%;
	color: #eee;
	background-color: #5a7;
	font-size: 170%;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
}
.next::before {
	content: "≫";
}
.next:hover {
	color: #fff;
	background-color: #6b8;
}
.next:active {
	color: #fff;
	background-color: #7c9;
}

.button {
	background-image: linear-gradient(#fff, #ccc 70%);
	font-weight: bold;
}
@media (orientation: portrait) {
	.button {
		padding: 3% 5%;
	}
}
.button:hover {
	color: #222;
	background-image: linear-gradient(#fff 5%, #ccc 100%);
}
.button:active {
	color: #222;
	background-image: linear-gradient(#fff 5%, #ccc 100%);
}
</style>
