import { useOptionStore } from "./store";
import Player from "./Player.vue";

let images;
async function loadImages() {
	images = await Player.loadImages([
		"player5-1.jpg",
		"player5-2.jpg",
		"player5-3.jpg"
	]);
}

function getProfile() {
	return {
		image: images["player5-1.jpg"].src,
		description: "MIDI音源でよく音楽を聴いている。"
	};
}

const store = useOptionStore();

class ComPlayer {
	getImage(player) {
		if (player.action == Player.ACTION.BANKRUPT || player.result == Player.RESULT.LOSE) return images["player5-3.jpg"].src;
		if (player.result == Player.RESULT.WIN) return images["player5-2.jpg"].src;
		if (player.action == Player.ACTION.FOLD) {
			return images[player.betTotal < 4 && player.chip > Math.floor(store.initChip / 4) ? "player5-1.jpg" : "player5-3.jpg"].src;
		}
		return images["player5-1.jpg"].src;
	}

	getBet(player, players, betMax) {
		let foldRate = 1;
		switch (betMax) {
		case 0:
			foldRate = 0.1;
			break;
		case 1:
			foldRate = 0.4;
			break;
		case 2:
			foldRate = 0.5;
			break;
		case 3:
			foldRate = 0.7;
			break;
		case 4:
			foldRate = 0.9;
			break;
		}

		switch (player.hand.type) {
		case Player.HAND.NO_PAIR:
			const suitCount = Player.countSuit(player.cards);
			const sequenceCount = Player.countSequence(player.cards);
			if (suitCount == 4) {
				foldRate *= 0.2;
			} else if (suitCount == 3 && sequenceCount <= 3) {
				foldRate *= 0.9;
			} else if (sequenceCount == 4) {
				foldRate *= 0.2;
			} else if (sequenceCount == 3) {
				foldRate *= 0.9;
			} else {
				foldRate *= 0.95;
			}
			break;
		case Player.HAND.ONE_PAIR:
			if (player.hand.details[0].number <= 11) {
				foldRate *= 0.5 - 0.45 * ((player.hand.details[0].number - 2) / 10);
			} else {
				foldRate = 0;
			}
			break;
		default:
			foldRate = 0;
			break;
		}

		if (Math.random() < foldRate && Math.random() < 0.9) return -1;

		let betRate = 0;
		switch (player.hand.type) {
		case Player.HAND.NO_PAIR:
			betRate = Math.random() < 0.85 ? 0.2 : 0.75;
			break;
		case Player.HAND.ONE_PAIR:
			betRate = 0.5;
			break;
		case Player.HAND.TWO_PAIR:
			betRate = 0.6;
			break;
		default:
			betRate = 0.9;
			break;
		}

		let bet = 0;
		for (let i = 0; i < 5; i++) {
			if (Math.random() < betRate) {
				bet++;
			} else {
				break;
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
			// 同じスートが3つなら確率的に、4つ以上なら確定でホールド
			if (suit != null && (suitCount[suit] >= 4 || Math.random() < 0.5)) {
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
			// 連番が3つなら確率的に、4つ以上なら確定でホールド
			if (sequenceCount == 1 && Math.random() < 0.3 || sequenceCount >= 2) {
				isHold = true;
			} else {
				for (let card of cards) card.isHold = false;
			}
		}

		if (!isHold) {
			for (let card of cards) {
				if (card.number == 11 && Math.random() < 0.1) card.isHold = true;
				if (card.number == 12 && Math.random() < 0.3) card.isHold = true;
				if (card.number == 13 && Math.random() < 0.7) card.isHold = true;
				if (card.number == 14 && Math.random() < 0.8) card.isHold = true;
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
