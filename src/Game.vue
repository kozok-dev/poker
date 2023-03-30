<script setup>
import { ref, onMounted } from "vue";
import { useOptionStore } from "./store";
import Sound from "./sound";
import Phase from "./Phase.vue";
import Pot from "./Pot.vue";
import Player from "./Player.vue";
import Card from "./Card.vue";
import PushButton from "./PushButton.vue";
import NumberSelect from "./NumberSelect.vue";

const store = useOptionStore();

const phase = ref();
const pot = ref();
const players = ref();

const buttonFold = ref();
const buttonCheck = ref();
const buttonCall = ref();
const buttonBet = ref();
const buttonRaise = ref();
const buttonAllIn = ref();
const buttonDraw = ref();
const buttonNext = ref();
const buttonEnd = ref();
const numberSelect = ref();
const isShowNumberSelect = ref(false);

const props = defineProps({
	comPlayerInfos: Array,
	playerCount: Number,
	comPlayers: Array
});
const emit = defineEmits(["game-end"]);

onMounted(async () => {
	for (let i = 0; i < players.value.length; i++) {
		players.value[i].chip = store.initChip;
		if (i < players.value.length - 1) players.value[i].comPlayer = new props.comPlayerInfos[props.comPlayers[i]].ComPlayer();
	}

	hideButtons();
	buttonNext.value.$el.style.display = "none";
	buttonEnd.value.$el.style.display = "none";

	doGame();
});

// ゲーム
async function doGame() {
	// ベットラウンド1
	const dealerIndex = await doStart();

	let isContinue = await doBet(dealerIndex);
	await wait(200);

	// ドロー
	if (isContinue) await doDraw(dealerIndex);

	// ベットラウンド2
	if (isContinue) {
		phase.value.phase = Phase.PHASE.BET2;
		isContinue = await doBet(dealerIndex);
		await wait(200);
	}

	// ショウダウン
	await doShowdown(dealerIndex, isContinue);
}

// ゲーム開始(DEALERマークがついている人のindexを返す)
async function doStart() {
	buttonNext.value.$el.style.display = "none";

	Card.init();
	phase.value.phase = Phase.PHASE.BET1;
	pot.value.pot = 0;
	for (let player of players.value) {
		player.setAction(null);
		player.result = null;
		player.hand = null;
		player.betTotal = 0;

		if (player.comPlayer == null) {
			player.image = Player.defaultImage[0].src;
		} else {
			player.image = player.comPlayer.getImage(player);
		}
	}

	// 次の参加者にDEALERマークをつける
	let dealerIndex = players.value.findIndex(player => player.isDealer);
	for (let i = 0; i < players.value.length; i++) {
		if (dealerIndex == -1) {
			dealerIndex = Math.floor(Math.random() * players.value.length);
			players.value[dealerIndex].isDealer = true;
		} else {
			players.value[dealerIndex].isDealer = false;
			dealerIndex = (dealerIndex + 1) % players.value.length;
			players.value[dealerIndex].isDealer = true;
		}

		if (players.value[dealerIndex].isActive()) break;
	}

	const promises = [];
	let promiseSort = null;
	for (let i = 0; i < players.value.length; i++) {
		const index = (dealerIndex + 1 + i) % players.value.length;
		const player = players.value[index];
		const cardLength = player.cards.length;

		// アンティ支払い、ポットに追加
		if (player.isActive()) {
			promises.push((async () => {
				await wait(i * cardLength * 20);
				player.chip--;
				player.betTotal++;
				pot.value.pot++;
			})());
		}

		// 各プレイヤーにカードを配る
		if (player.isActive() || player.cards[0].number != null) {
			for (let j = 0; j < cardLength; j++) {
				promises.push((async () => {
					await wait(i * cardLength * 20 + j * 20);
					await player.changeCard(
						j,
						player.isActive() ? Card.draw() : null,
						player.comPlayer != null
					);

					// プレイヤー操作のみカード並べ替え
					if (player.comPlayer == null && j == cardLength - 1) {
						promiseSort = player.sortCards();
					}
				})());
			}
		}
	}
	Sound.play("card3");
	await Promise.all(promises);
	await promiseSort;

	for (let player of players.value) {
		player.hand = player.getHand();
		if (player.comPlayer != null) player.image = player.comPlayer.getImage(player);
	}

	return dealerIndex;
}

// ベットラウンド(参加人数が1人以下ならfalseを返す)
async function doBet(dealerIndex) {
	let betMax = 0;
	for (let player of players.value) {
		if (player.isActive()) player.bet = 0;
	}

	let startIndex = dealerIndex + 1;
	for (let i = 0; i < players.value.length; i++) {
		const index = (startIndex + i) % players.value.length;
		const player = players.value[index];

		if (!player.isActive() || player.action == Player.ACTION.ALL_IN) continue;

		let action, bet;
		const chip = player.chip + player.bet;

		if (player.comPlayer == null) {
			// プレイヤー操作
			player.setAction(null);
			bet = await onBet(chip, betMax);
		} else {
			// コンピューター操作
			bet = player.comPlayer.getBet(player, players.value, betMax);
		}

		if (bet > 5) bet = 5;
		if (bet > chip) bet = chip;

		// アクションを設定
		if (bet < 0) {
			action = Player.ACTION.FOLD;
		} else if (chip < betMax) {
			action = Player.ACTION.ALL_IN;
			bet = chip;
		} else if (betMax == 0) {
			action = bet == 0 ? Player.ACTION.CHECK : Player.ACTION.BET;
		} else if (bet <= betMax) {
			action = Player.ACTION.CALL;
			bet = betMax;
		} else {
			action = Player.ACTION.RAISE;
		}

		if ((action == Player.ACTION.BET || action == Player.ACTION.RAISE) && betMax != bet) {
			// ベットを変更した人からもう1周させる
			startIndex = index;
			i = 0;
		}

		player.setAction(action);
		if (action == Player.ACTION.BET || action == Player.ACTION.RAISE) betMax = bet;
		if (action == Player.ACTION.CALL || action == Player.ACTION.BET || action == Player.ACTION.RAISE || action == Player.ACTION.ALL_IN) {
			const betDiff = bet - player.bet;
			if (betDiff > 0) {
				player.chip -= betDiff;
				player.bet += betDiff;
				player.betTotal += betDiff;
				pot.value.pot += betDiff;
			}
		}

		if (player.comPlayer != null) player.image = player.comPlayer.getImage(player);

		await wait(store.getWaitTime(100));

		// 参加人数が1人以下ならfalseを返す
		let activeCount = 0;
		for (let player of players.value) {
			if (player.isActive()) activeCount++;
		}
		if (activeCount <= 1) return false;
	}

	return true;
}

// ベット操作
function onBet(chip, betMax) {
	return new Promise(resolve => {
		buttonFold.value.$el.style.display = null;
		if (betMax == 0) {
			buttonCheck.value.$el.style.display = null;
			if (chip > 0) buttonBet.value.$el.style.display = null;
		} else {
			if (chip >= betMax) buttonCall.value.$el.style.display = null;
			if (chip >= betMax + 1 && betMax < 5) buttonRaise.value.$el.style.display = null;
			if (chip < betMax) buttonAllIn.value.$el.style.display = null;
		}

		if (buttonBet.value.$el.style.display != "none" || buttonRaise.value.$el.style.display != "none") {
			numberSelect.value.number = 1;
			numberSelect.value.numberMin = betMax + 1;
			numberSelect.value.numberMax = chip < 5 ? chip : 5;
			isShowNumberSelect.value = true;
		}

		buttonFold.value.$el.onclick = () => {
			hideButtons();
			resolve(-1);
		};
		buttonCheck.value.$el.onclick = () => {
			hideButtons();
			resolve(0);
		};
		buttonCall.value.$el.onclick = () => {
			hideButtons();
			resolve(betMax);
		};
		buttonBet.value.$el.onclick = () => {
			hideButtons();
			resolve(numberSelect.value.number);
		};
		buttonRaise.value.$el.onclick = () => {
			hideButtons();
			resolve(numberSelect.value.number);
		};
		buttonAllIn.value.$el.onclick = () => {
			hideButtons();
			resolve(chip);
		};

		Sound.play("action");
	});
}

// ドロー
async function doDraw(dealerIndex) {
	phase.value.phase = Phase.PHASE.DRAW;
	for (let player of players.value) {
		if (player.isActive()) player.setAction(null);
	}

	let promiseSort = null;

	for (let i = 0; i < players.value.length; i++) {
		const index = (dealerIndex + 1 + i) % players.value.length;
		const player = players.value[index];

		if (!player.isActive()) continue;

		if (player.comPlayer == null) {
			// プレイヤー操作
			await onDraw(player);
		} else {
			// コンピューター操作
			const cards = player.cards.map(card => ({number: card.number, suit: card.suit}));

			player.sortCardsImmediate(cards);
			// 最弱数字のストレートなら1番目がA(14)になっているはずなのでA(1)にする
			if (player.isWeakStraight(cards)) cards[0].number = 1;

			const changeCards = player.comPlayer.getChangeCards(cards);

			for (let j = 0; j < player.cards.length; j++) {
				const card = player.cards[j];
				if (changeCards.findIndex(changeCard => card.number == changeCard.number && card.suit == changeCard.suit) != -1) {
					card.isSelected = true;
				}
			}
		}

		const changeCards = [];

		// カード交換の前処理
		for (let j = 0; j < player.cards.length; j++) {
			const card = player.cards[j];
			if (!card.isSelected) continue;

			changeCards.push({index: j, beforeNumber: card.number, beforeSuit: card.suit});
			card.isSelected = false;
		}

		// カード交換
		const promises = [];
		for (let changeCard of changeCards) {
			promises.push(player.changeCard(changeCard.index, Card.draw()));
		}
		if (changeCards.length > 0) Sound.play("card2");
		await Promise.all(promises);

		// 交換前のカードを山札に戻す
		for (let changeCard of changeCards) {
			Card.add({number: changeCard.beforeNumber, suit: changeCard.beforeSuit});
		}

		// プレイヤー操作のみカード並べ替え
		if (player.comPlayer == null) {
			await wait(100);
			promiseSort = player.sortCards();
		}

		player.hand = player.getHand();
		if (player.comPlayer != null) player.image = player.comPlayer.getImage(player);

		await wait(store.getWaitTime(100));
	}

	await promiseSort;
}

// ドロー操作
function onDraw(player) {
	return new Promise(resolve => {
		player.selectableCard = true;
		buttonDraw.value.$el.style.display = null;

		buttonDraw.value.$el.onclick = () => {
			player.selectableCard = false;
			hideButtons();
			resolve();
		};

		Sound.play("action");
	});
}

// ショウダウン
async function doShowdown(dealerIndex, isContinue) {
	phase.value.phase = Phase.PHASE.SHOWDOWN;
	for (let player of players.value) {
		if (player.isActive()) player.setAction(null);
	}

	if (isContinue) Sound.play("showdown");

	const promises = [];

	// コンピューターのカード並べ替え
	for (let player of players.value) {
		if (player.comPlayer == null) continue;
		if (!player.isActive() || !isContinue) continue;

		promises.push(player.sortCards());
	}
	await Promise.all(promises);

	// コンピューターのカードオープン
	promises.splice(0, promises.length);
	for (let player of players.value) {
		if (player.comPlayer == null) continue;
		if (!player.isActive() || !isContinue) continue;

		promises.push(player.toggleCards());
	}
	await Promise.all(promises);

	// 勝敗判定
	let indexMaxes = [];
	let handMax = null;
	for (let i = 0; i < players.value.length; i++) {
		const hand = players.value[i].hand;

		if (!players.value[i].isActive()) {
			players.value[i].hand = null;
			continue;
		}

		if (handMax == null) {
			indexMaxes.push(i);
			handMax = hand;
		} else {
			const compare = compareHand(handMax, hand);
			if (compare < 0) {
				indexMaxes.splice(0, indexMaxes.length);
				indexMaxes.push(i);
				handMax = hand;
			} else if (compare == 0) {
				indexMaxes.push(i);
			}
		}
	}

	// 勝敗表示
	let isLose = false;
	for (let i = 0; i < players.value.length; i++) {
		if (players.value[i].isActive()) {
			if (indexMaxes.includes(i)) {
				// 勝ち
				players.value[i].result = Player.RESULT.WIN;
				if (!isContinue) players.value[i].hand = null;
			} else {
				// 負け
				players.value[i].result = Player.RESULT.LOSE;
				isLose = true;
			}
		}
	}
	if (!isLose && isContinue) {
		// 2人以上参加している状態で全員勝ちは引き分け
		for (let player of players.value) {
			if (player.isActive()) player.result = Player.RESULT.DRAW;
		}
	}

	// ベット精算
	settleBet(dealerIndex);
	pot.value.pot = 0;

	for (let player of players.value) {
		if (player.chip <= 0 && player.action != Player.ACTION.BANKRUPT) {
			player.setAction(Player.ACTION.BANKRUPT);
		}

		if (player.comPlayer != null) player.image = player.comPlayer.getImage(player);
		player.betTotal = 0;
	}

	if (players.value[players.value.length - 1].chip <= 0) {
		// 自分が破産
		buttonEnd.value.$el.style.display = null;
	} else {
		let isContinuable = false;
		let isNotContinuable = false;
		for (let player of players.value) {
			if (player.comPlayer == null) continue;
			if (player.chip > 0) isContinuable = true;
			if (player.chip <= 0) isNotContinuable = true;
		}

		if (isNotContinuable) {
			// コンピューターが1人以上破産
			if (!store.isContinueComPlayerLose || !isContinuable) {
				buttonEnd.value.$el.style.display = null;
			} else {
				buttonNext.value.$el.style.display = null;
			}
		} else {
			// 誰も破産していない
			buttonNext.value.$el.style.display = null;
		}
	}

	Sound.play(players.value[players.value.length - 1].result == Player.RESULT.WIN ? "win" : "lose");
}

// 役の強さ比較(aが強いなら1、弱いなら-1、同じなら0)
function compareHand(a, b) {
	if (a.type < b.type) {
		return -1;
	} else if (a.type > b.type) {
		return 1;
	} else {
		// typeが同じ場合、detailsは同じ構成のはず

		if (a.type == 3) {
			// 通常、3♣-3♦-4♣-4♦-5♣と2♣-2♦-4♣-4♥-5♣では前者が勝つが、後続処理でスート強弱ありだと後者が勝ちになってしまう
			// ツーペアは両方のペアが同じ数字の場合にスート比較させたいので、強い方のペアではスート比較しない
			if (a.details[0].number == b.details[0].number) {
				if (a.details[1].number < b.details[1].number) {
					return -1;
				} else if (a.details[1].number > b.details[1].number) {
					return 1;
				}
			}
		}

		for (let i = 0; i < a.details.length; i++) {
			const aDetail = a.details[i];
			const bDetail = b.details[i];
			if (aDetail.number < bDetail.number) {
				return -1;
			} else if (aDetail.number > bDetail.number) {
				return 1;
			} else if (store.useSuitJudge && aDetail.suitMax < bDetail.suitMax) {
				return -1;
			} else if (store.useSuitJudge && aDetail.suitMax > bDetail.suitMax) {
				return 1;
			}
		}
		return 0;
	}
}

// ベット精算(オールインを考慮し、勝者にアンティ含めたベットに応じたチップを加算。計算上、引き分けも勝者と見なす)
function settleBet(dealerIndex) {
	for (let player of players.value) {
		player._isWin = (player.result == Player.RESULT.WIN || player.result == Player.RESULT.DRAW) && player.betTotal > 0;
		player._betTotal = player.betTotal;
	}

	// 勝者の中で最初に行動する人のindexを取得
	let startIndex;
	for (let i = 0; i < players.value.length; i++) {
		startIndex = (dealerIndex + 1 + i) % players.value.length;
		if (players.value[startIndex]._isWin) break;
	}

	for (;;) {
		let minBet = null;	// 最小ベット
		let betCount = 0;	// ベットした人数
		let winCount = 0;	// 勝者数

		for (let player of players.value) {
			if (player._betTotal > 0) {
				if (minBet == null || minBet > player._betTotal) minBet = player._betTotal;
				betCount++;
			}
			if (player._isWin) winCount++;
		}

		// 勝者がいなくなればループ終了
		if (winCount == 0) break;

		// 勝者に獲得チップを加算
		for (let i = 0; i < players.value.length; i++) {
			const player = players.value[i];

			if (player._betTotal > 0) player._betTotal -= minBet;

			if (player._isWin) {
				// 獲得チップ加算
				player.chip += Math[i == startIndex ? "ceil" : "floor"](minBet * betCount / winCount);

				// 獲得チップが確定したら計算上、次から勝者と見なさないようにする
				if (player._betTotal <= 0) player._isWin = false;
			}
		}
	}

	// 余ったチップは返却
	for (let player of players.value) {
		player.chip += player._betTotal;
		delete player._isWin;
		delete player._betTotal;
	}
}

// 各操作ボタン非表示
function hideButtons() {
	for (let button of [buttonFold, buttonCheck, buttonCall, buttonBet, buttonRaise, buttonAllIn, buttonDraw]) {
		button.value.$el.style.display = "none";
		button.value.$el.onclick = null;
	}
	isShowNumberSelect.value = false;
}

function wait(time) {
	return new Promise(resolve => {
		setTimeout(resolve, time);
	});
}
</script>

<template>
	<div class="table">
		<Phase ref="phase" />
		<Pot ref="pot" />

		<div class="player-container" :class="{[`player${props.playerCount}`]: true}">
			<Player v-for="i in props.playerCount" ref="players" />
		</div>

		<div class="button-container">
			<PushButton class="button" ref="buttonFold">フォールド</PushButton>
			<PushButton class="button" ref="buttonCheck">チェック</PushButton>
			<PushButton class="button" ref="buttonCall">コール</PushButton>
			<span class="number-select" v-show="isShowNumberSelect"><NumberSelect ref="numberSelect" />&nbsp;枚</span>
			<PushButton class="button bet" ref="buttonBet">ベット</PushButton>
			<PushButton class="button bet" ref="buttonRaise">レイズ</PushButton>
			<PushButton class="button" ref="buttonAllIn">オールイン</PushButton>
			<PushButton class="button" ref="buttonDraw">カード交換</PushButton>
			<PushButton class="button" ref="buttonNext" @push="doGame">次のゲーム</PushButton>
			<PushButton class="button" ref="buttonEnd" @push="emit('game-end')">ゲーム終了</PushButton>
		</div>
	</div>
</template>

<style scoped>
.table {
	height: 90%;
}

@media (orientation: landscape) {
	.player-container {
		display: flex;
		flex-wrap: wrap;
	}

	.player-container.player2 {
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
	}
	.player-container.player3 {
		justify-content: space-around;
	}
	.player-container.player4,
	.player-container.player6,
	.player-container.player7 {
		justify-content: space-between;
	}
	.player-container.player5 {
		justify-content: space-evenly;
	}
}
@media (orientation: portrait) {
	.player-container.player2, .player-container.player3 {
		height: 80%;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
}

.button-container {
	display: flex;
	justify-content: center;
	align-items: center;
}
.button {
	margin: 0 1em;
	color: #005;
	background-image: linear-gradient(#fff, #aaf 70%);
	border: 0.05em solid #bbf;
	font-weight: bold;
}
@media (orientation: portrait) {
	.button {
		margin: 0 0.3em;
		padding: 3%;
	}
}
.button:hover {
	color: #225;
	background-image: linear-gradient(#fff, #ccf 70%);
}
.button:active {
	color: #225;
	background-image: linear-gradient(#fff, #ccf 70%);
}
.button.bet {
	margin-left: 0.5em;
}

.number-select {
	margin-left: 1em;
}
</style>
