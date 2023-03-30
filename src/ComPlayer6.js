import Player from "./Player.vue";

let images;
async function loadImages() {
	images = await Player.loadImages([
		"player6-1.jpg",
		"player6-2.jpg",
		"player6-3.jpg",
		"player6-4.jpg",
		"player6-5.jpg"
	]);
}

function getProfile() {
	return {
		image: images["player6-1.jpg"].src,
		description: "基本賭け事はしない。たまに勝っても怒る。"
	};
}

class ComPlayer {
	getImage(player) {
		if (player.action == Player.ACTION.BANKRUPT) return images["player6-1.jpg"].src;
		if (player.result == Player.RESULT.WIN) {
			if (player.hand != null && player.hand.type >= Player.HAND.TWO_PAIR && Math.random() < 0.8 || Math.random() < 0.2) {
				return images["player6-5.jpg"].src;
			} else {
				return images[player.hand == null && Math.random() < 0.7 ? "player6-1.jpg" : "player6-2.jpg"].src;
			}
		}
		if (player.result == Player.RESULT.LOSE) {
			return images[player.hand != null && player.hand.type >= Player.HAND.TWO_PAIR ? "player6-3.jpg" : "player6-4.jpg"].src;
		}
		if (player.action == Player.ACTION.FOLD) {
			return images[player.betTotal < 3 ? "player6-1.jpg" : (player.betTotal < 5 ? "player6-3.jpg" : "player6-5.jpg")].src;
		}
		return images["player6-1.jpg"].src;
	}

	getBet(player, players, betMax) {
		let foldRate = Math.random();

		switch (player.hand.type) {
		case Player.HAND.NO_PAIR:
			const suitCount = Player.countSuit(player.cards);
			const sequenceCount = Player.countSequence(player.cards);
			if (suitCount == 4) {
				foldRate *= 0.5;
			} else if (suitCount == 3 && sequenceCount <= 3) {
				foldRate *= 0.9;
			} else if (sequenceCount == 4) {
				foldRate *= 0.5;
			} else if (sequenceCount == 3) {
				foldRate *= 0.9;
			}
			break;
		case Player.HAND.ONE_PAIR:
			if (player.hand.details[0].number <= 10) {
				foldRate *= 0.5 - 0.45 * ((player.hand.details[0].number - 2) / 9);
			} else {
				foldRate = 0;
			}
			break;
		default:
			foldRate = 0;
			break;
		}

		if (Math.random() < foldRate) return -1;

		let betRate = 0;
		let isBreak = false;
		switch (player.hand.type) {
		case Player.HAND.NO_PAIR:
			betRate = 0.3;
			isBreak = true;
			break;
		case Player.HAND.ONE_PAIR:
			betRate = 0.5;
			isBreak = true;
			break;
		case Player.HAND.TWO_PAIR:
			betRate = 0.4;
			break;
		default:
			betRate = 0.6;
			break;
		}

		let bet = 0;
		for (let i = 0; i < 5; i++) {
			if (Math.random() < betRate) {
				bet++;
			} else {
				if (isBreak) break;
			}
		}

		return bet;
	}

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
				if (suitCount[card.suit] >= 3) suit = card.suit;
			}
			// 同じスートが3つ以上なら確率的にホールド
			if (suit != null && (suitCount[suit] >= 4 && Math.random() < 0.8 || Math.random() < 0.3)) {
				for (let card of cards) {
					if (card.suit == suit) card.isHold = true;
				}
				isHold = true;
			}
		}

		// 連番が4つ以上あればホールド
		if (!isHold) {
			let sequenceCount = 0;
			for (let i = 0; i < 3; i++) {
				if (cards[i].number + 1 == cards[i + 1].number && cards[i].number + 2 == cards[i + 2].number) {
					cards[i].isHold = true;
					cards[i + 1].isHold = true;
					cards[i + 2].isHold = true;
					sequenceCount++;
				}
			}
			// 同じスートが3つ以上なら確率的にホールド
			if (sequenceCount == 1 && Math.random() < 0.2 || sequenceCount >= 2 && Math.random() < 0.7) {
				isHold = true;
			} else {
				for (let card of cards) card.isHold = false;
			}
		}

		if (!isHold) {
			for (let card of cards) {
				if (card.number == 12 && Math.random() < 0.2) card.isHold = true;
				if (card.number == 13 && Math.random() < 0.5) card.isHold = true;
				if (card.number == 14 && Math.random() < 0.7) card.isHold = true;
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
