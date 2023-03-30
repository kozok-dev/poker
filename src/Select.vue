<script setup>
import { ref } from "vue";
import Sound from "./sound";

const props = defineProps({
	option: Object,
	selected: null
});
const emit = defineEmits(["change"]);

const selected = ref(props.selected);

function select(key) {
	if (selected.value == key) return;

	selected.value = key;

	Sound.play("button");
	emit("change", key);
}
</script>

<template>
	<div class="select">
		<div v-for="option in props.option" :class="{selected: option.key == selected}" @click="select(option.key)">
			{{ option.value }}
		</div>
	</div>
</template>

<style scoped>
.select {
	display: flex;
}
.select div {
	min-width: 7em;
	padding: 0.5em;
	color: #fff;
	background-color: #596;
	text-align: center;
	border-radius: 0.2em;
	cursor: pointer;
}
.select div:not(:first-child) {
	margin-left: 0.5em;
}

.select div.selected {
	background-color: #445;
	text-decoration: underline;
	cursor: default;
}
.select div:not(.selected):hover {
	background-color: #7b8;
}
.select div:not(.selected):active {
	background-color: #7b8;
}
</style>
