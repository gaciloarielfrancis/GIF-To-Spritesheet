import type { TFrame } from '../types'
import { decodeGifBuffer } from './gif'
import { decodeWebpBuffer, isWebpBuffer } from './webp'

export type TAnimationFormat = 'gif' | 'webp'

function isGifBuffer(buffer: Uint8Array): boolean {
	if (buffer.length < 6) return false
	return (
		buffer[0] === 0x47 && // G
		buffer[1] === 0x49 && // I
		buffer[2] === 0x46 && // F
		buffer[3] === 0x38 && // 8
		(buffer[4] === 0x37 || buffer[4] === 0x39) && // 7 or 9
		buffer[5] === 0x61 // a
	)
}

/** Sniff the container magic; fall back to the file extension when bytes are ambiguous. */
export function detectAnimationFormat(buffer: Uint8Array, fileName = ''): TAnimationFormat | null {
	if (isGifBuffer(buffer)) return 'gif'
	if (isWebpBuffer(buffer)) return 'webp'
	if (/\.webp$/i.test(fileName)) return 'webp'
	if (/\.gif$/i.test(fileName)) return 'gif'
	return null
}

/** Decode GIF or (animated) WebP bytes into ordered frame canvases. */
export async function decodeAnimationBuffer(
	buffer: Uint8Array,
	fileName = '',
): Promise<{ format: TAnimationFormat; width: number; height: number; frames: TFrame[] }> {
	const detected = detectAnimationFormat(buffer, fileName)
	if (detected === 'webp') {
		const decoded = await decodeWebpBuffer(buffer)
		return { format: 'webp', ...decoded }
	}
	if (detected === 'gif') {
		const decoded = await decodeGifBuffer(buffer)
		return { format: 'gif', ...decoded }
	}
	throw new Error(`Unsupported file "${fileName || 'unknown'}" — only .gif and animated .webp are supported`)
}
