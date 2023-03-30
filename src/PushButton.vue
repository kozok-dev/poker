<script setup>
import Sound from "./sound";

const emit = defineEmits(["push"]);
</script>

<template>
	<button class="push-button" @click="emit('push')" @mousedown="Sound.play('button')"><slot /></button>
</template>

<style scoped>
.push-button {
	padding: 1% 2%;
	border: 0;
	border-radius: 0.3em;
	font-size: var(--font-size);
	font-family: sans-serif;
	filter: drop-shadow(0.1em 0.1em 0.2em rgba(0, 0, 0, 0.3));
	cursor: pointer;
	transition: filter 0.1s, transform 0.1s;
}
.push-button[disabled] {
	cursor: auto;
}
.push-button:not([disabled]):active {
	transform: scale(1.1);
	filter: drop-shadow(0 0 0.2em rgba(0, 0, 0, 0.3));
}
</style>
