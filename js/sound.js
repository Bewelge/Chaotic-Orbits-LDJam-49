import { DomHelper } from "./DomHelper.js"

import { rndBtwn } from "./Util.js"

var freqs = {
	A: 440,
	C: 523.3,
	E: 659.3,
	G: 392,
	B: 439.9,
	D: 587.3,
	F: 349.2
}
let chords = [
	[freqs.A, freqs.C, freqs.E],
	[freqs.G, freqs.B, freqs.D],
	[freqs.F, freqs.A, freqs.C],
	[freqs.G, freqs.B, freqs.D]
]
var durs = [0.25, 0.5, 1, 2, 4]
var muted = false
export class Music {
	constructor() {
		this.curChord = 0
		this.nextChordAt = 0
		this.nextNoteAt = 0
		this.nextBeatAt = 0
		this.chordLength = 1.5
		this.rythm = [2, 0.25, 0.25, 0.5]
		this.breaks = 0.8
		this.queue = {}
		this.muted = false
	}
	init(muted) {
		this.ctx = new AudioContext()
		this.muted = muted
	}
	mute() {
		this.muted = !this.muted
	}
	playRandomNote() {
		let dur = durs[Math.floor(rndBtwn(0, durs.length))]
		let note = chords[this.curChord][Math.floor(rndBtwn(0, 3))]
		this.playNote(
			this.ctx,
			note,
			rndBtwn(0.1, 0.05),
			this.time,
			this.nextNoteAt - this.time,
			dur * this.breaks,
			"triangle"
		)
		this.nextNoteAt += dur
	}

	playNote(note, gain, delay, dur, type) {
		let c = this.ctx
		let time = c.currentTime
		var o = c.createOscillator()
		var g = c.createGain()
		g.gain.value = 0
		g.gain.setValueAtTime(0, time + delay)
		g.gain.linearRampToValueAtTime(gain, time + delay + 0.25)
		g.gain.setValueAtTime(gain, time + delay + dur)
		g.gain.exponentialRampToValueAtTime(0.00001, time + delay + dur + 1)
		o.type = type || "sine"
		o.connect(g)
		o.frequency.value = note
		o.start(time + delay)
		o.stop(time + delay + dur + 2)
		g.connect(c.destination)
		window.setTimeout(() => {
			g.disconnect()
			o.disconnect()
		}, (delay + dur + 2) * 1000)
	}
	playSound(sound, dur = 1) {
		let soundKey = sound.id
		if (this.muted) return
		dur *= sound.dur * rndBtwn(0.9, 1.1)
		if (!this.queue.hasOwnProperty(soundKey)) {
			this.queue[soundKey] = []
		}
		let qu = this.queue[soundKey]
		if (qu.length > sound.max) return
		let c = this.ctx
		let time = c.currentTime
		let o = c.createOscillator()
		o.frequency.value = sound.freq * rndBtwn(0.9, 1.1)
		o.type = sound.type || "sine"
		let g = c.createGain()
		g.gain.value = 0
		g.gain.setValueAtTime(0, time)
		sound.gains.forEach(ga => {
			g.gain.linearRampToValueAtTime(ga[1], time + dur * ga[0])
		})
		if (sound.freqs) {
			sound.freqs.forEach(ga => {
				o.frequency.exponentialRampToValueAtTime(ga[1], time + dur * ga[0])
			})
		}
		o.connect(g)
		o.start(time)
		o.stop(time + dur)
		g.connect(c.destination)
		qu.push(o)
		window.setTimeout(() => {
			g.disconnect()
			o.disconnect()
			qu.splice(qu.indexOf(o), 1)
		}, (dur + 0.1) * 1000)
	}
}
const music = new Music(false)
export const initMusic = muted => {
	music.init(muted)
}
export const playSound = (soundName, dur) => music.playSound(soundName, dur)
export const muteAll = () => music.mute()
export const playNote = (note, dur) => music.playNote(note, 0.5, 0, dur, "sine")
export const SOUNDS = {
	shoot: {
		gains: [
			[0.1, 0.03],
			[0.1, 0.08],
			[1, 0]
		],
		freq: 140,
		dur: 0.1,
		max: 5,
		id: "shoot"
	},
	hit: {
		gains: [
			[0.1, 0.5],
			[0.15, 0.1],
			[0.2, 0.4],
			[0.25, 0.1],
			[0.3, 0.3],
			[0.4, 0.1],
			[1, 0]
		],
		freq: 30,
		dur: 1,
		type: "sine",
		max: 5,
		id: "hit"
	},
	explosion: {
		gains: [
			[0.1, 0.5],
			[0.12, 0.1],
			[0.14, 0.5],
			[0.16, 0.1],
			[0.18, 0.5],
			[1, 0]
		],
		freq: 40,
		dur: 0.6,
		max: 2,
		id: "explosion"
	},
	merge: {
		gains: [
			[0.1, 0.1],
			[0.9, 0.1],
			[1, 0]
		],
		freqs: [[1, 440]],
		freq: 80,
		dur: 0.5,
		max: 1,
		id: "merge"
	},
	mergeDown: {
		gains: [
			[0.1, 0.1],
			[0.9, 0.1],
			[1, 0]
		],
		// freqs: [[0, 600]],
		// freqs: [[0.5, 440]],
		freqs: [[1, 80]],
		freq: 440,
		dur: 0.5,
		max: 1,
		id: "merge"
	}
}
