<script setup>
import { ref } from "vue";
import Modal from "./Modal.vue";
import PushButton from "./PushButton.vue";

const modal = ref();

const emit = defineEmits(["yes"]);

defineExpose({
	show() {
		modal.value.show();
	},
	hide() {
		modal.value.hide();
	}
});
</script>

<template>
	<Modal ref="modal">
		<template #title>確認</template>
		<template #body>
			<div class="body">ゲームを終了しますか？</div>
		</template>
		<template #button>
			<PushButton class="button" @push="modal.hide(); emit('yes');">はい</PushButton>
			<PushButton class="button" @push="modal.hide()">いいえ</PushButton>
		</template>
	</Modal>
</template>

<style scoped>
.body {
	margin-top: 1em;
	font-size: 120%;
	text-align: center;
}

.button {
	width: 5em;
	margin: 1em;
	padding: 0.5em;
	box-sizing: content-box;
}
</style>
