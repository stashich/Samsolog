/**
 * Web Audio API Sound Effects Synthesizer for Astana Runner 3D.
 * Generates procedural audio effects without external asset downloads.
 */

class SoundEngine {
	private ctx: AudioContext | null = null;

	private init() {
		if (!this.ctx && typeof window !== 'undefined') {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			if (AudioCtx) {
				this.ctx = new AudioCtx();
			}
		}
		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
	}

	// 1. Jump Sound Effect (Pitch Sweep Up)
	playJump() {
		this.init();
		if (!this.ctx) return;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(160, this.ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.18);

		gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start();
		osc.stop(this.ctx.currentTime + 0.18);
	}

	// 2. Slide Sound Effect (Low Noise Whoosh)
	playSlide() {
		this.init();
		if (!this.ctx) return;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'triangle';
		osc.frequency.setValueAtTime(220, this.ctx.currentTime);
		osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.25);

		gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start();
		osc.stop(this.ctx.currentTime + 0.25);
	}

	// 3. Samsa / Coin Collect Chime (Two-Tone Sparkle)
	playPickup() {
		this.init();
		if (!this.ctx) return;

		const now = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(587.33, now); // D5
		osc.frequency.setValueAtTime(880, now + 0.08); // A5

		gain.gain.setValueAtTime(0.25, now);
		gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start();
		osc.stop(now + 0.22);
	}

	// 4. Shield Powerup Activate (Rising Energy Chime)
	playShield() {
		this.init();
		if (!this.ctx) return;

		const now = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(300, now);
		osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

		gain.gain.setValueAtTime(0.2, now);
		gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start();
		osc.stop(now + 0.35);
	}

	// 5. Crash / Game Over Sound (Low Frequency Noise Thud)
	playCrash() {
		this.init();
		if (!this.ctx) return;

		const now = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'square';
		osc.frequency.setValueAtTime(130, now);
		osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

		gain.gain.setValueAtTime(0.4, now);
		gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start();
		osc.stop(now + 0.4);
	}
}

export const soundFx = new SoundEngine();
