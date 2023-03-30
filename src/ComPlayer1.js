import { useOptionStore } from "./store";
import Player from "./Player.vue";

// 画像読み込み
let images;
async function loadImages() {
	images = await Player.loadImages([
		"player1-1.jpg",
		"player1-2.jpg",
		"player1-3.jpg",
		"player1-4.jpg",
		"player1-5.jpg"
	]);
}

// プレイヤー情報取得
function getProfile() {
	return {
		image: images["player1-1.jpg"].src,
		description: "大勝すると本性が出る。"
	};
}

const store = useOptionStore();

class ComPlayer {
	// プレイヤー画像ファイル名取得
	getImage(player) {
		if (player.action == Player.ACTION.BANKRUPT) return images["player1-4.jpg"].src;
		if (player.result == Player.RESULT.WIN && player.chip >= Math.floor(store.initChip * 0.8) && player.betTotal >= 5) return images["player1-2.jpg"].src;
		if (player.action == Player.ACTION.FOLD || player.result == Player.RESULT.DRAW) return images["player1-3.jpg"].src;
		if (player.result == Player.RESULT.LOSE) return images[player.betTotal < 4 ? "player1-4.jpg" : "player1-5.jpg"].src;
		return images["player1-1.jpg"].src;
	}

	// ベット取得(負数でフォールド)
	getBet(player, players, betMax) {
		// 既に一定数のベットが行われていてノーペアの場合、高確率でフォールドする
		if (betMax >= (player.bet == 0 ? 5 : 3) && player.hand.type == Player.HAND.NO_PAIR) {
			if (Math.random() < 0.95) return -1;
		}

		let bet;

		if (player.bet == 0) {
			if (player.hand.type == Player.HAND.NO_PAIR) {
				bet = 0;
			} else if (player.hand.type == Player.HAND.ONE_PAIR) {
				bet = 1;
			} else if (player.hand.type == Player.HAND.TWO_PAIR) {
				bet = 2;
			} else {
				bet = 3;
			}
		} else {
			if (player.hand.type == Player.HAND.NO_PAIR) {
				bet = 1;
			} else if (player.hand.type == Player.HAND.ONE_PAIR) {
				bet = 2;
			} else if (player.hand.type == Player.HAND.TWO_PAIR) {
				bet = 3;
			} else {
				bet = 4;
			}

			// 低確率でベットにブラフをかける
			if (Math.random() < 0.1) {
				bet += Math.floor(Math.random() * 5);
				if (bet > 5) bet = 5;
			}
		}

		return bet;
	}

	// 交換するカードを{number, suit}形式の配列で取得
	getChangeCards(cards) {
		let isHold = false;

		// 同じ数字があればホールド
		let beforeCard = null;
		for (let card of cards) {
			if (card.isHold) continue;

			if (beforeCard != null && card.number == beforeCard.number) {
				card.isHold = true;
				beforeCard.isHold = true;
				isHold = true;
			}
			beforeCard = card;
		}

		// 同じスートが4つ以上あればホールド
		if (!isHold) {
			let suit = null;
			const suitCount = {};
			for (let card of cards) {
				if (suitCount[card.suit] == null) suitCount[card.suit] = 0;
				suitCount[card.suit]++;
				if (suitCount[card.suit] >= 4) suit = card.suit;
			}
			if (suit != null) {
				for (let card of cards) {
					if (card.suit == suit) card.isHold = true;
				}
				isHold = true;
			}
		}

		// 連番が4つ以上あればホールド
		if (!isHold) {
			for (let i = 0; i < 2; i++) {
				if (cards[i].number + 1 == cards[i + 1].number && cards[i].number + 2 == cards[i + 2].number && cards[i].number + 3 == cards[i + 3].number) {
					cards[i].isHold = true;
					cards[i + 1].isHold = true;
					cards[i + 2].isHold = true;
					cards[i + 3].isHold = true;
				}
			}
		}

		// ホールドしなかったカードが交換対象
		const changeCards = [];
		for (let card of cards) {
			if (!card.isHold) changeCards.push(card);
		}

		return changeCards;
	}
}

export default {getProfile, loadImages, ComPlayer};
