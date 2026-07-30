export type GameAction = 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE' | 'DOUBLE_TAP';

export interface GestureOptions {
	onAction: (action: GameAction) => void;
	minSwipeDistance?: number;
	maxTapDelay?: number;
}

/**
 * Attaches swipe, double-tap, and keyboard event listeners to the given element or window.
 */
export function createGestureListener(element: HTMLElement | Window, options: GestureOptions) {
	const minSwipeDistance = options.minSwipeDistance ?? 25;
	const maxTapDelay = options.maxTapDelay ?? 280;

	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let lastTapTime = 0;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length > 1) return;
		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		startTime = Date.now();
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.changedTouches.length === 0) return;
		const touch = e.changedTouches[0];
		const endX = touch.clientX;
		const endY = touch.clientY;
		const deltaX = endX - startX;
		const deltaY = endY - startY;
		const absX = Math.abs(deltaX);
		const absY = Math.abs(deltaY);
		const duration = Date.now() - startTime;

		// 1. Detect Swipe
		if (absX >= minSwipeDistance || absY >= minSwipeDistance) {
			if (absX > absY) {
				// Horizontal Swipe
				if (deltaX > 0) {
					options.onAction('RIGHT');
				} else {
					options.onAction('LEFT');
				}
			} else {
				// Vertical Swipe
				if (deltaY > 0) {
					options.onAction('SLIDE');
				} else {
					options.onAction('JUMP');
				}
			}
		} else if (duration < 250) {
			// 2. Detect Double Tap
			const now = Date.now();
			if (now - lastTapTime < maxTapDelay) {
				options.onAction('DOUBLE_TAP');
				lastTapTime = 0;
			} else {
				lastTapTime = now;
			}
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowLeft':
			case 'a':
			case 'A':
				e.preventDefault();
				options.onAction('LEFT');
				break;
			case 'ArrowRight':
			case 'd':
			case 'D':
				e.preventDefault();
				options.onAction('RIGHT');
				break;
			case 'ArrowUp':
			case 'w':
			case 'W':
				e.preventDefault();
				options.onAction('JUMP');
				break;
			case 'ArrowDown':
			case 's':
			case 'S':
				e.preventDefault();
				options.onAction('SLIDE');
				break;
			case ' ':
			case 'Enter':
				e.preventDefault();
				options.onAction('DOUBLE_TAP');
				break;
		}
	}

	element.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
	element.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
	window.addEventListener('keydown', handleKeyDown);

	return {
		destroy() {
			element.removeEventListener('touchstart', handleTouchStart as EventListener);
			element.removeEventListener('touchend', handleTouchEnd as EventListener);
			window.removeEventListener('keydown', handleKeyDown);
		}
	};
}
