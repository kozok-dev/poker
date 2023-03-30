import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const useOptionStore = defineStore("option", () => {
	// 各設定と初期値
	const data = {
		playerCount: 4,	// プレイヤー数
		initChip: 50,	// 初期チップ数
		useSuitJudge: false,	// スートを勝敗判定に使用するか
		isContinueComPlayerLose: false,	// コンピューターが破産しても続けるか
		useGradient: true,	// グラデーション表現を行うか
		gameSpeed: 7,	// ゲームスピード
		soundVolume: 5,	// 効果音の大きさ
	};
	const store = {};

	for (let key in data) {
		// localStorageから取得
		let item = window.localStorage.getItem(key);
		if (item == null) {
			item = data[key];
		} else {
			switch (typeof(data[key])) {
			case "boolean":
				item = item != "0";
				break;
			case "number":
				item = parseFloat(item);
				break;
			}
		}
		store[key] = ref(item);

		// 変更されたらlocalStorageに反映
		watch(() => store[key].value, () => {
			let value = store[key].value;
			if (typeof(value) == "boolean") value = value ? 1 : 0;
			window.localStorage.setItem(key, value);
		});
	}

	store.getWaitTime = function (time) {
		return time + (10 - store.gameSpeed.value) * 130;
	};

	return store;
});
