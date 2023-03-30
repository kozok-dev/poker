<script setup>
import { ref } from "vue";
import Modal from "./Modal.vue";
import Card from "./Card.vue";
import PushButton from "./PushButton.vue";

const modal = ref();

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
		<template #title>遊び方</template>
		<template #body>
			ベットラウンド1 → ドロー → ベットラウンド2 → ショウダウン のフェーズで進行します。<br>
			基本的にDEALERマークがついている人の次の人から順に行動します。<br>
			<br>
			<b>ベットラウンド1</b><br>
			アンティが支払われ、カードが5枚配られます。<br>
			その後、ベット等を行って賭けるチップを決めます。最大5枚まで賭けることができます。<br>
			フォールドした人を除き、賭けたチップが全員同じ枚数になると次のフェーズへ移行します。<br>
			コールやベットするチップが足りない場合はオールインすることもできます。<br>
			<br>
			<b>ドロー</b><br>
			カードの交換を行います。好きな枚数を交換できますが、交換しなくても構いません。<br>
			交換すると次のフェーズとなるので、交換を行えるのは一度だけです。<br>
			<br>
			<b>ベットラウンド2</b><br>
			ベットラウンド1と同じように、再度賭けるチップを決めます。<br>
			<br>
			<b>ショウダウン</b><br>
			フォールドした人以外全員の手札をオープンします。一番強い役を持っている人の勝ちとなり、賭けたチップを総取りできます。<br>
			<br>
			<h3 class="section">ポーカーの役</h3>
			<span class="p-hide">右</span>下に行くほど強い役になります。<br>同じ役同士は数字の強さで比較し、弱い数字から2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, Aとなります。数字も同じ場合は他のカードの数字の強さで比較します。
			<div class="hand-container">
				<div class="hand">
					<b>ノーペア</b>
					<div class="card-container">
						<Card :number="2" :suit="1" />
						<Card :number="5" :suit="4" />
						<Card :number="7" :suit="3" />
						<Card :number="8" :suit="2" />
						<Card :number="13" :suit="4" />
					</div>
					役なし
				</div>
				<div class="hand">
					<b>ワンペア</b>
					<div class="card-container">
						<Card :number="5" :suit="3" />
						<Card :number="6" :suit="1" />
						<Card :number="6" :suit="4" />
						<Card :number="10" :suit="1" />
						<Card :number="12" :suit="2" />
					</div>
					2枚同じ数字のカードが1組
				</div>
				<div class="hand">
					<b>ツーペア</b>
					<div class="card-container">
						<Card :number="4" :suit="2" />
						<Card :number="4" :suit="4" />
						<Card :number="9" :suit="1" />
						<Card :number="11" :suit="3" />
						<Card :number="11" :suit="4" />
					</div>
					2枚同じ数字のカードが2組
				</div>
				<div class="hand">
					<b>スリーカード</b>
					<div class="card-container">
						<Card :number="9" :suit="4" />
						<Card :number="12" :suit="2" />
						<Card :number="14" :suit="1" />
						<Card :number="14" :suit="2" />
						<Card :number="14" :suit="4" />
					</div>
					3枚同じ数字のカードがある
				</div>
				<div class="hand">
					<b>ストレート</b>
					<div class="card-container">
						<Card :number="14" :suit="1" />
						<Card :number="2" :suit="2" />
						<Card :number="3" :suit="3" />
						<Card :number="4" :suit="3" />
						<Card :number="5" :suit="1" />
					</div>
					5枚のカードが順番になっている
				</div>
				<div class="hand">
					<b>フラッシュ</b>
					<div class="card-container">
						<Card :number="3" :suit="1" />
						<Card :number="5" :suit="1" />
						<Card :number="9" :suit="1" />
						<Card :number="10" :suit="1" />
						<Card :number="14" :suit="1" />
					</div>
					5枚のカードが同じスートになっている
				</div>
				<div class="hand">
					<b>フルハウス</b>
					<div class="card-container">
						<Card :number="8" :suit="2" />
						<Card :number="8" :suit="4" />
						<Card :number="10" :suit="1" />
						<Card :number="10" :suit="2" />
						<Card :number="10" :suit="3" />
					</div>
					ワンペアとスリーカードがある
				</div>
				<div class="hand">
					<b>フォーカード</b>
					<div class="card-container">
						<Card :number="9" :suit="1" />
						<Card :number="9" :suit="2" />
						<Card :number="9" :suit="3" />
						<Card :number="9" :suit="4" />
						<Card :number="14" :suit="3" />
					</div>
					4枚同じ数字のカードがある
				</div>
				<div class="hand">
					<b>ストレートフラッシュ</b>
					<div class="card-container">
						<Card :number="5" :suit="3" />
						<Card :number="6" :suit="3" />
						<Card :number="7" :suit="3" />
						<Card :number="8" :suit="3" />
						<Card :number="9" :suit="3" />
					</div>
					ストレートかつフラッシュになっている
				</div>
				<div class="hand">
					<b>ロイヤルストレートフラッシュ</b>
					<div class="card-container">
						<Card :number="10" :suit="4" />
						<Card :number="11" :suit="4" />
						<Card :number="12" :suit="4" />
						<Card :number="13" :suit="4" />
						<Card :number="14" :suit="4" />
					</div>
					ストレートフラッシュの最も強い数字
				</div>
			</div>
			<br>
			<h3 class="section">用語</h3>
			<b>スート</b><br>
			トランプの絵柄(マーク)のこと。<br>
			<br>
			<b>アンティ</b><br>
			参加料。ここではチップ1枚になります。<br>
			<br>
			<b>ポット</b><br>
			全員が賭けたチップの合計が表示されます。強い役で勝ってもこれが少ないとあまり得しないことになります。<br>
			<br>
			<b>ベット</b><br>
			チップを賭けます。ここでは一度に2枚以上賭けることもできます。<br>
			<br>
			<b>チェック</b><br>
			チップを賭けずに進めます。誰もベットを行っていない場合のみ可能です。<br>
			<br>
			<b>コール</b><br>
			前の人と同じ枚数のチップを賭けます。<br>
			<br>
			<b>レイズ</b><br>
			前の人より多い枚数のチップを賭けます。<br>
			<br>
			<b>フォールド</b><br>
			ゲームを降ります。それまで賭けたチップは戻りません。<br>
			思うような手札がこないことも多いので、うまく利用しましょう。<br>
			<br>
			<b>オールイン</b><br>
			全額賭けて進めます。コールやベットするチップが足りない場合に使用できます。<br>
			他のプレイヤーより少ない額で賭ける分、勝ってもそれに応じた額しか貰えず、残りは他のプレイヤーに返却されます。
		</template>
		<template #button>
			<PushButton class="button" @push="modal.hide()">閉じる</PushButton>
		</template>
	</Modal>
</template>

<style scoped>
.hand-container {
	text-align: center;
}
.hand {
	margin-top: 1em;
}
@media (orientation: landscape) {
	.hand-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.hand {
		width: 45%;
	}
}

@media (orientation: portrait) {
	.p-hide {
		display: none;
	}
}

.card-container {
	width: 25em;
	margin: auto;
	font-size: 70%;
	display: flex;
}

.section {
	margin: 0 0 0.5em 0;
	padding: 0 0.3em;
	border-left: 0.2em solid #6b7;
	border-bottom: 1px solid #6b7;
	font-size: 110%;
}
</style>
