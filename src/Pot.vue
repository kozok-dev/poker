<script setup>
import { ref, watch } from "vue";
import anime from "animejs";

const pot = ref(0);
const potView = ref(pot.value);

watch(pot, () => {
	anime({
		targets: potView,
		value: pot.value,
		round: 1,
		duration: 200,
		easing: "easeOutCubic"
	});
});

defineExpose({
	pot
});
</script>

<template>
	<div class="pot-container">
		<div class="label">ポット</div>
		<div class="pot">{{ potView }}枚</div>
	</div>
</template>

<style scoped>
.pot-container {
	width: 100%;
	padding: 0.3em;
	background-color: #152;
	box-sizing: border-box;
	display: flex;
}
.label {
	width: 50%;
	margin-right: 0.5em;
	text-align: right;
}
.pot {
	width: 50%;
	margin-left: 0.5em;
}
</style>
