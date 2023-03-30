import Player from "./Player.vue";

let images;
async function loadImages() {
	images = await Player.loadImages([
		"player2-1.jpg",
		"player2-2.jpg",
		"player2-3.jpg"
	]);
}

function getProfile() {
	return {
		image: images["player2-1.jpg"].src,
		description: "ポーカーフェイスの欠片もなく、すぐ表情に出る。"
	};
}

class ComPlayer {
	getImage(player) {
		if (player.action == Player.ACTION.BANKRUPT) return images["player2-3.jpg"].src;
		if (player.result == Player.RESULT.WIN) return images["player2-2.jpg"].src;
		if (player.result == Player.RESULT.LOSE) return images[player.betTotal > 1 ? "player2-3.jpg" : "player2-1.jpg"].src;
		if (player.action == Player.ACTION.FOLD) return images[player.betTotal < 4 ? "player2-1.jpg" : "player2-3.jpg"].src;

		if (player.hand != null) {
			if (player.hand.type >= Player.HAND.TWO_PAIR) return images["player2-2.jpg"].src;
			if (player.betTotal > 3 && player.hand.type == Player.HAND.NO_PAIR) return images["player2-3.jpg"].src;
		}

		return images["player2-1.jpg"].src;
	}

	getBet(player, players, betMax) {
		if (player.hand.type < Player.HAND.TWO_PAIR) {
			if (betMax >= 3 && player.hand.type == Player.HAND.NO_PAIR) return -1;
			if (Math.random() < 0.05) return -1;
		} else {
			return 5;
		}
		return Math.floor(Math.random() * 6);
	}

	getChangeCards(cards) {
		let isHold = false;

		// 連番
		let sequenceCount = 0;
		for (let i = 0; i < 3; i++) {
			if (cards[i].number + 1 == cards[i + 1].number && cards[i].number + 2 == cards[i + 2].number) {
				cards[i].isHold = true;
				cards[i + 1].isHold = true;
				cards[i + 2].isHold = true;
				sequenceCount++;
			}
		}
		// 連番が3つなら低確率で、4つ以上なら確定でホールド
		if (sequenceCount == 1 && Math.random() < 0.1) {
			isHold = true;
		} else if (sequenceCount >= 2) {
			isHold = true;
		} else {
			for (let card of cards) card.isHold = false;
		}

		// 同じ数字があればホールド
		if (!isHold) {
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
		}

		// 同じスートが3つなら低確率で、4つ以上なら確定でホールド
		if (!isHold) {
			let suit = null;
			const suitCount = {};
			for (let card of cards) {
				if (suitCount[card.suit] == null) suitCount[card.suit] = 0;
				suitCount[card.suit]++;
				if (suitCount[card.suit] >= 3) suit = card.suit;
			}
			if (suit != null && (suitCount[suit] >= 4 || Math.random() < 0.1)) {
				for (let card of cards) {
					if (card.suit == suit) card.isHold = true;
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

export default {loadImages, getProfile, ComPlayer};
