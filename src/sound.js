import { useOptionStore } from "./store";

const context = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {};

const fileNames = Object.freeze([
	"action",
	"bet",
	"button",
	"card1",
	"card2",
	"card3",
	"check",
	"fold",
	"lose",
	"num-sel1",
	"num-sel2",
	"raise",
	"showdown",
	"win"
]);

const gainNode = context.createGain();
gainNode.connect(context.destination);

// 音声読み込み
async function load() {
	const promises = [];
	for (let fileName of fileNames) {
		promises.push((async () => {
			const response = await window.fetch(`${fileName}.mp3`);
			const data = await response.arrayBuffer();
			const buffer = await new Promise(resolve => {
				context.decodeAudioData(data, resolve);
			});
			sounds[fileName] = {buffer, source: null};
		})());
	}

	await Promise.all(promises);
}

// 音声再生
async function play(fileName) {
	const sound = sounds[fileName];

	if (sound == null) return;
	if (context.state == "suspended") await context.resume();
	if (sound.source != null) sound.source.stop();

	const store = useOptionStore();
	gainNode.gain.value = store.soundVolume / 10;
	if (gainNode.gain.value <= 0) return;

	sound.source = context.createBufferSource();
	sound.source.buffer = sound.buffer;
	sound.source.connect(gainNode);
	sound.source.start();
}

export default {load, play};
