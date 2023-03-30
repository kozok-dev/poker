<script>
const PHASE = Object.freeze({
	BET1: 1,
	DRAW: 2,
	BET2: 3,
	SHOWDOWN: 4
});

export default {PHASE};
</script>

<script setup>
import { ref } from "vue";

const phase = ref(1);

defineExpose({
	phase
});
</script>

<template>
	<h2 class="phase">
		<Transition>
			<div class="title" v-if="phase == PHASE.BET1">ベットラウンド1</div>
			<div class="title" v-else-if="phase == PHASE.DRAW">ドロー</div>
			<div class="title" v-else-if="phase == PHASE.BET2">ベットラウンド2</div>
			<div class="title" v-else>ショウダウン</div>
		</Transition>
	</h2>
</template>

<style scoped>
.phase {
	position: relative;
	height: 1.4em;
	margin: 0 0 0.3em 0;
	padding: 0 0.3em;
	color: #ef9;
	background-color: #484;
	border: 1px solid #6b7;
	font-size: 120%;
	overflow: hidden;
}
.title {
	position: absolute;
}

.v-enter-active, .v-leave-active {
	transition: transform 1s;
}
.v-enter-from {
	transform: translateY(1.4em);
}
.v-leave-to {
	transform: translateY(-1.4em);
}
</style>
