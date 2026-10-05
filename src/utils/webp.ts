import type { TFrame } from '../types'

/** True when bytes look like a WebP container (RIFF....WEBP). Covers lossy, lossless, and extended/animated WebP. */
export function isWebpBuffer(buffer: Uint8Array): boolean {
	if (buffer.length < 12) return false
	return (
		buffer[0] === 0x52 && // R
		buffer[1] === 0x49 && // I
		buffer[2] === 0x46 && // F
		buffer[3] === 0x46 && // F
		buffer[8] === 0x57 && // W
		buffer[9] === 0x45 && // E
		buffer[10] === 0x42 && // B
		buffer[11] === 0x50 // P
	)
}

function getImageDecoder(): any | null {
	const ctor = (globalThis as unknown as { ImageDecoder?: any }).ImageDecoder
	return typeof ctor === 'function' ? ctor : null
}

export function isAnimatedWebpSupported(): boolean {
	return getImageDecoder() !== null
}

/**
 * Heuristic for animated WebP: animated files use the extended VP8X container
 * and must contain ANIM / ANMF chunks. Static lossy (VP8 ) / lossless (VP8L)
 * files never do. A raw byte scan can false-positive on pixel data, but in
 * practice it reliably distinguishes the two for fallback messaging.
 */
export function looksLikeAnimatedWebp(buffer: Uint8Array): boolean {
	if (!isWebpBuffer(buffer)) return false
	// "VP8X" + animation flag is the authoritative signal; scan for it first.
	for (let i = 12; i + 16 < buffer.length && i < 64; i++) {
		if (buffer[i] === 0x56 && buffer[i + 1] === 0x50 && buffer[i + 2] === 0x38 && buffer[i + 3] === 0x58) {
			// VP8X chunk data starts 8 bytes after the FourCC (FourCC + chunk size).
			const flags = buffer[i + 8]
			if ((flags & 0x02) !== 0) return true
			break
		}
	}
	// Fall back to ANIM / ANMF chunk presence.
	for (let i = 12; i + 4 < buffer.length; i++) {
		if (buffer[i] === 0x41 && buffer[i + 1] === 0x4e) {
			const c = buffer[i + 2]
			const d = buffer[i + 3]
			if ((c === 0x49 && d === 0x4d) || (c === 0x4d && d === 0x46)) return true
		}
	}
	return false
}

/**
 * Decode WebP bytes (animated or static) into ordered frame canvases.
 * Uses the native WebCodecs ImageDecoder when available so every animation
 * frame is extracted; falls back to a single-frame <img> decode for static
 * WebP. Animated WebP without WebCodecs throws an explanatory error instead
 * of silently returning only the first frame.
 */
export async function decodeWebpBuffer(buffer: Uint8Array): Promise<{ width: number; height: number; frames: TFrame[] }> {
	const Decoder = getImageDecoder()
	if (!Decoder) {
		if (looksLikeAnimatedWebp(buffer)) {
			throw new Error(
				'Animated WebP is not supported in this browser (WebCodecs unavailable) — please use a recent Chrome, Edge, or Safari, where every frame can be extracted',
			)
		}
		return decodeStaticImageBuffer(buffer, 'image/webp')
	}

	let decoder: any = null
	try {
		// Slice to detach from any shared ArrayBuffer the FileReader may reuse.
		const data = buffer.slice().buffer as ArrayBuffer
		decoder = new Decoder({ data, type: 'image/webp' })
		await decoder.tracks.ready
		const track = decoder.tracks.selectedTrack
		const frameCount = Math.max(1, track?.frameCount ?? 1)

		const frames: TFrame[] = []
		let width = 0
		let height = 0

		for (let i = 0; i < frameCount; i++) {
			const result = await decoder.decode({ frameIndex: i, completeFramesOnly: true })
			const videoFrame: VideoFrame = result.image
			try {
				const w = videoFrame.displayWidth || videoFrame.codedWidth
				const h = videoFrame.displayHeight || videoFrame.codedHeight
				if (w <= 0 || h <= 0) continue
				if (width === 0) {
					width = w
					height = h
				}
				const canvas = document.createElement('canvas')
				canvas.width = w
				canvas.height = h
				const ctx = canvas.getContext('2d')
				if (!ctx) throw new Error('Canvas 2D context unavailable')
				ctx.clearRect(0, 0, w, h)
				ctx.drawImage(videoFrame, 0, 0, w, h)

				// VideoFrame duration is in microseconds; keep milliseconds like the GIF decoder.
				const durationMs = typeof videoFrame.duration === 'number' && videoFrame.duration > 0 ? videoFrame.duration / 1000 : 0
				frames.push({
					delay: durationMs,
					disposalMethod: 0,
					height: h,
					image: canvas,
					interlaced: false,
					leftPos: 0,
					localColourTableFlag: false,
					time: 0,
					topPos: 0,
					width: w,
				})
			} finally {
				videoFrame.close()
			}
		}

		if (frames.length === 0) {
			throw new Error('No frames found in WebP')
		}
		return { width, height, frames }
	} catch (err) {
		// Explicit decode failures (empty animation, no canvas) always surface.
		if (err instanceof Error && /no frames|canvas|webcodecs|not supported/i.test(err.message)) throw err
		// If the file looks animated, don't silently degrade to one frame —
		// surface the real failure so the user knows frames would be lost.
		if (looksLikeAnimatedWebp(buffer)) {
			throw err instanceof Error ? err : new Error('Failed to parse WebP file')
		}
		// Static WebP (or a browser that claims ImageDecoder but can't handle
		// WebP) still gets a chance via the single-frame <img> path.
		try {
			return await decodeStaticImageBuffer(buffer, 'image/webp')
		} catch {
			throw err instanceof Error ? err : new Error('Failed to parse WebP file')
		}
	} finally {
		try {
			await decoder?.close?.()
		} catch {
			// ignore close errors
		}
	}
}

/** Decode any still image bytes via <img> into a single-frame result (fallback for static WebP / no WebCodecs). */
export async function decodeStaticImageBuffer(
	buffer: Uint8Array,
	mimeType: string,
): Promise<{ width: number; height: number; frames: TFrame[] }> {
	const blob = new Blob([buffer.slice().buffer as ArrayBuffer], { type: mimeType })
	const url = URL.createObjectURL(blob)
	try {
		const img = await loadHtmlImage(url)
		const width = img.naturalWidth || img.width
		const height = img.naturalHeight || img.height
		if (!width || !height) throw new Error('No frames found in image')
		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Canvas 2D context unavailable')
		ctx.clearRect(0, 0, width, height)
		ctx.drawImage(img, 0, 0, width, height)
		return {
			width,
			height,
			frames: [
				{
					delay: 0,
					disposalMethod: 0,
					height,
					image: canvas,
					interlaced: false,
					leftPos: 0,
					localColourTableFlag: false,
					time: 0,
					topPos: 0,
					width,
				},
			],
		}
	} catch (err) {
		throw err instanceof Error ? err : new Error('Failed to parse image file')
	} finally {
		setTimeout(() => URL.revokeObjectURL(url), 4000)
	}
}

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Failed to parse WebP file — the file may be corrupt or animated WebP is unsupported in this browser'))
		img.src = url
	})
}
