<script setup>
import { ref } from "vue";

const props = defineProps({
	large: Boolean,
});

const isShow = ref(false);

function show() {
	isShow.value = true;
	setTimeout(() => {
		document.addEventListener("click", hide);
	}, 0);
}

function hide() {
	isShow.value = false;
	document.removeEventListener("click", hide);
}

defineExpose({
	show,
	hide
});
</script>

<template>
	<Transition :duration="200">
		<div class="modal-container" v-show="isShow">
			<div class="overlay"></div>
			<div class="modal" :class="{large: props.large}" @click.stop>
				<div class="title"><slot name="title" /></div>
				<div class="body"><slot name="body" /></div>
				<div class="button-container"><slot name="button" /></div>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
/* モーダル */
.modal-container {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}
.overlay {
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
}
.modal {
	position: absolute;
	left: 50%;
	top: 50%;
	width: 45%;
	max-height: 90%;
	background-color: #263;
	border: 0.05em solid #7b8;
	border-radius: 0.5em;
	overflow: hidden;
	transform: translate(-50%, -50%);
}
@media (orientation: portrait) {
	.modal {
		width: 75%;
	}
}
.large {
	width: 90%;
}

.v-enter-active .overlay, .v-leave-active .overlay {
	transition: opacity 0.2s;
}
.v-enter-from .overlay, .v-leave-to .overlay {
	opacity: 0;
}
.v-enter-active .modal, .v-leave-active .modal {
	pointer-events: none;
	transition: opacity 0.2s, transform 0.2s;
}
.v-enter-from .modal, .v-leave-to .modal {
	transform: translate(-50%, -50%) scale(0.7);
	opacity: 0;
}
.v-enter-to .modal, .v-leave-from .modal {
	transform: translate(-50%, -50%) scale(1);
}

/* タイトル */
.title {
	width: 100%;
	padding-top: 0.1em;
	background-color: #041;
	font-weight: bold;
	text-align: center;
}

/* 本文 */
.body {
	padding: 0.5em;
	max-height: max(250px, min(65vw / 16 * 9, var(--vh) * 0.65));
	font-size: 80%;
	overflow: auto;
}
@media (orientation: portrait) {
	.body {
		max-height: max(500px, min(80vw / 9 * 16, var(--vh) * 0.8));
	}
}
.body::-webkit-scrollbar {
	width: 0.6em;
	height: 0.6em;
	background-color: #152;
	border-radius: 0.3em;
}
.body::-webkit-scrollbar-thumb {
	background-color: #030;
	border-radius: 0.3em;
}
.body::-webkit-scrollbar-corner {
	display: none;
}

/* ボタン */
.button-container {
	margin: 0.5em 0;
	text-align: center;
}
:slotted(.push-button) {
	margin: 0 0.5em;
	padding: 0.2em 1em;
	color: #fff;
	background: #263;
	border: 1px solid #7b8;
}
:slotted(.push-button:hover) {
	background: #485;
}
:slotted(.push-button:active) {
	background: #485;
}
</style>
