import GIFUtils from './gifDecoder'
import { uint8ArrayToBase64 } from './arrays'
import type { TFrame } from '../types'

interface IGifInstance {
	width: number
	height: number
	frames: TFrame[]
	load: (url: string) => void
	onload: ((ev: unknown) => void) | null
	onerror: ((ev: unknown) => void) | null
}

/** Decode GIF bytes into ordered frames (waits until all frames are parsed). */
export function decodeGifBuffer(buffer: Uint8Array): Promise<{ width: number; height: number; frames: TFrame[] }> {
	return new Promise((resolve, reject) => {
		try {
			const imageURL = `data:image/gif;base64,${uint8ArrayToBase64(buffer)}`
			const gif = GIFUtils() as unknown as IGifInstance
			gif.onload = () => {
				try {
					if (!gif.frames || gif.frames.length === 0) {
						reject(new Error('No frames found in GIF'))
						return
					}
					resolve({ width: gif.width, height: gif.height, frames: [...gif.frames] })
				} catch (err) {
					reject(err as Error)
				}
			}
			gif.onerror = () => reject(new Error('Failed to parse GIF file'))
			gif.load(imageURL)
		} catch (err) {
			reject(err as Error)
		}
	})
}
