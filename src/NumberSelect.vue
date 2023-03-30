<script setup>
import { ref, watch } from "vue";
import Sound from "./sound";

const number = ref(0);
const numberMin = ref(0);
const numberMax = ref(0);
const interval = ref(50);

const isShake = ref(false);

const emit = defineEmits(["change"]);

let timer = null;
let eventType = null;

// カウントダウン
function down(event) {
	if (eventType != null && eventType != event.type) return;
	eventType = event.type;

	if (number.value <= numberMin.value) {
		isShake.value = true;
		Sound.play("num-sel2");
		return;
	}

	number.value--;

	clearTimer();
	window.addEventListener("pointerup", clearTimer);
	timer = setTimeout(downByTimer, 200);

	Sound.play("num-sel1");

	emit("change");
}

// 押し続けた場合のカウントダウン
function downByTimer() {
	if (number.value <= numberMin.value) {
		clearTimer();
		return;
	}

	number.value--;
	timer = setTimeout(downByTimer, interval.value);

	Sound.play("num-sel1");

	emit("change");
}

// カウントアップ
function up(event) {
	if (eventType != null && eventType != event.type) return;
	eventType = event.type;

	if (number.value >= numberMax.value) {
		isShake.value = true;
		Sound.play("num-sel2");
		return;
	}

	number.value++;

	clearTimer();
	window.addEventListener("pointerup", clearTimer);
	timer = setTimeout(upByTimer, 200);

	Sound.play("num-sel1");

	emit("change");
}

// 押し続けた場合のカウントアップ
function upByTimer() {
	if (number.value >= numberMax.value) {
		clearTimer();
		return;
	}

	number.value++;
	timer = setTimeout(upByTimer, interval.value);

	Sound.play("num-sel1");

	emit("change");
}

function clearTimer() {
	if (timer == null) return;
	clearTimeout(timer);
	timer = null;
	window.removeEventListener("pointerup", clearTimer);
}

watch(() => [number.value, numberMin.value, numberMax.value], () => {
	if (number.value <= numberMin.value) number.value = numberMin.value;
	if (number.value >= numberMax.value) number.value = numberMax.value;
});

defineExpose({
	number,
	numberMin,
	numberMax,
	interval
});
</script>

<template>
	<span class="number-select">
		<div :class="{shake: isShake}" @animationend="isShake = false">{{ number }}</div>
		<div class="down" @pointerdown="down" @touchstart="down" @touchend="clearTimer" :class="{disabled: number <= numberMin}"></div>
		<div class="up" @pointerdown="up" @touchstart="up" @touchend="clearTimer" :class="{disabled: number >= numberMax}"></div>
	</span>
</template>

<style scoped>
.number-select {
	position: relative;
	width: 5em;
	padding: 0.2em;
	color: #000;
	background-image: linear-gradient(90deg, #ccc, #fff 25%, #fff 75%, #ccc);
	text-align: center;
	border-radius: 0.2em;
	display: inline-block;
}

.shake {
	animation: shake-anim 0.2s 1;
}
@keyframes shake-anim {
	0% {
		transform: translateX(0);
	}
	16% {
		transform: translateX(-0.1em);
	}
	50% {
		transform: translateX(0.1em);
	}
	84% {
		transform: translateX(-0.1em);
	}
	100% {
		transform: translateX(0);
	}
}

.down {
	position: absolute;
	left: 0;
	top: 0;
	width: 50%;
	height: 100%;
	padding: 0 0.5em;
	text-align: left;
	box-sizing: border-box;
	cursor: pointer;
	display: flex;
	align-items: center;
}
.down::before {
	font-weight: bold;
	content: "≪";
}

.up {
	position: absolute;
	width: 50%;
	height: 100%;
	right: 0;
	top: 0;
	padding: 0 0.5em;
	box-sizing: border-box;
	cursor: pointer;
	display: flex;
	justify-content: flex-end;
	align-items: center;
}
.up::before {
	font-weight: bold;
	content: "≫";
}

.down:not(.disabled):hover, .up:not(.disabled):hover {
	color: #555;
}
.down:active {
	transform: translateX(-0.2em);
}
.down:not(.disabled):active {
	color: #555;
}
.up:active {
	transform: translateX(0.2em);
}
.up:not(.disabled):active {
	color: #555;
}
.down.disabled, .up.disabled {
	color: #aaa;
}
</style>
