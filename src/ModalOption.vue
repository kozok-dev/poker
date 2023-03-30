<script setup>
import { ref, onMounted } from "vue";
import { useOptionStore } from "./store";
import Modal from "./Modal.vue";
import Select from "./Select.vue";
import PushButton from "./PushButton.vue";
import NumberSelect from "./NumberSelect.vue";

const store = useOptionStore();

const modal = ref();
const initChip = ref();
const gameSpeed = ref();
const soundVolume = ref();

const yesNo = [{key: true, value: "あり"}, {key: false, value: "なし"}];
const continueEnd = [{key: true, value: "続ける"}, {key: false, value: "ゲーム終了"}];

onMounted(() => {
	initChip.value.number = store.initChip;
	initChip.value.numberMin = 10;
	initChip.value.numberMax = 100;
	initChip.value.interval = 20;

	gameSpeed.value.number = store.gameSpeed;
	gameSpeed.value.numberMin = 1;
	gameSpeed.value.numberMax = 10;

	soundVolume.value.number = store.soundVolume;
	soundVolume.value.numberMin = 0;
	soundVolume.value.numberMax = 10;
});

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
	<Modal ref="modal" :large="true">
		<template #title>設定</template>
		<template #body>
			<div class="table">
				<div class="th">
					<div>初期チップ数</div>
				</div>
				<div class="td">
					<NumberSelect ref="initChip" @change="store.initChip = initChip.number" />
				</div>

				<div class="th">
					<div>スートの強弱<br><span class="small">役と数字が同じ場合、♣&lt;♦&lt;♥&lt;♠で判定</span></div>
				</div>
				<div class="td">
					<Select :option="yesNo" :selected="store.useSuitJudge" @change="key => { store.useSuitJudge = key; }" />
				</div>

				<div class="th">
					<div>相手が1人でも破産したら<br><span class="small">自分が破産した場合を除く</span></div>
				</div>
				<div class="td">
					<Select :option="continueEnd" :selected="store.isContinueComPlayerLose" @change="key => { store.isContinueComPlayerLose = key; }" />
				</div>

				<div class="th">
					<div>グラデーション表現<br><span class="small">背景とカードのみ</span></div>
				</div>
				<div class="td">
					<Select :option="yesNo" :selected="store.useGradient" @change="key => { store.useGradient = key; }" />
				</div>

				<div class="th">
					<div>ゲームスピード</div>
				</div>
				<div class="td">
					<NumberSelect ref="gameSpeed" @change="store.gameSpeed = gameSpeed.number" />
				</div>

				<div class="th">
					<div>効果音の大きさ</div>
				</div>
				<div class="td">
					<NumberSelect ref="soundVolume" @change="store.soundVolume = soundVolume.number" />
				</div>
			</div>
		</template>
		<template #button>
			<PushButton class="button" @push="modal.hide()">閉じる</PushButton>
		</template>
	</Modal>
</template>

<style scoped>
.table {
	width: 90%;
	margin: auto;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}
@media (orientation: portrait) {
	.table {
		width: 100%;
	}
}

.th, .td {
	margin: 0.05em;
	padding: 0.9em;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
}
.th {
	width: 30%;
	background-color: #152;
	font-weight: normal;
	text-align: right;
	justify-content: flex-end;
}
.td {
	width: 60%;
	background-color: #374;
}
@media (orientation: portrait) {
	.td {
		width: 55%;
	}
}

.small {
	color: #6b7;
	font-size: 70%;
}
</style>
