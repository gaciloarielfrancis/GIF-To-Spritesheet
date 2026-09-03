import { ref } from 'vue'
import JSZip from 'jszip'
import type { IConverterProgress, ImageFormat, ISpritesheet, TBuffer } from '../types'
import { decodeGifBuffer } from '../utils/gif'
import { resolveTargetSize, resizeImage } from '../utils/images'
import { generateSpritesheet } from '../utils/spritesheet'
import { sanitizeFileName } from '../utils/arrays'

export interface IConvertOptions {
	width: number
	height: number
	quality: number
	format: ImageFormat
	columns: number
}

export function useGifConverter() {
	const spritesheets = ref<ISpritesheet[]>([])
	const processing = ref(false)
	const hasResults = ref(false)
	const progress = ref<IConverterProgress>({ current: 0, total: 0, stage: '', fileName: '' })
	const error = ref<string | null>(null)
	const zipping = ref(false)

	async function convert(buffers: TBuffer[], options: IConvertOptions): Promise<void> {
		if (buffers.length === 0) return
		processing.value = true
		hasResults.value = false
		error.value = null
		spritesheets.value = []
		progress.value = { current: 0, total: buffers.length, stage: 'Decoding GIFs', fileName: '' }

		const results: ISpritesheet[] = []
		try {
			for (let b = 0; b < buffers.length; b++) {
				const item = buffers[b]
				const safeName = sanitizeFileName(item.name)
				progress.value = {
					current: b,
					total: buffers.length,
					stage: `Decoding ${b + 1}/${buffers.length}`,
					fileName: item.name,
				}

				const decoded = await decodeGifBuffer(item.buffer)
				const target = resolveTargetSize(decoded.width, decoded.height, options.width, options.height)

				progress.value = {
					current: b,
					total: buffers.length,
					stage: `Rendering ${decoded.frames.length} frames`,
					fileName: item.name,
				}

				// Preserve frame order (original forEach+async could scramble order).
				const resized = await Promise.all(
					decoded.frames.map((frame) => resizeImage(frame.image.toDataURL('image/png'), target.width, target.height)),
				)
				const frameImages = resized.map((r) => r.image)
				const frameW = resized[0]?.width ?? target.width
				const frameH = resized[0]?.height ?? target.height

				progress.value = {
					current: b,
					total: buffers.length,
					stage: 'Packing spritesheet',
					fileName: item.name,
				}

				const sheet = await generateSpritesheet(
					frameImages,
					{ name: safeName, width: frameW, height: frameH, quality: options.quality, format: options.format },
					options.columns,
				)
				results.push(sheet)
				progress.value = { current: b + 1, total: buffers.length, stage: 'Done', fileName: item.name }
			}
			spritesheets.value = results
			hasResults.value = true
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Conversion failed'
		} finally {
			processing.value = false
		}
	}

	async function downloadZip(): Promise<void> {
		if (spritesheets.value.length === 0 || zipping.value) return
		zipping.value = true
		try {
			const zip = new JSZip()
			for (const sprite of spritesheets.value) {
				zip.file(sprite.image.name, sprite.image.data, sprite.image.options)
				zip.file(sprite.json.name, sprite.json.content)
			}
			const blob = await zip.generateAsync({ type: 'blob' })
			triggerBlobDownload(blob, `gif-to-spritesheets-${Date.now()}.zip`)
		} finally {
			zipping.value = false
		}
	}

	function downloadSheet(sheet: ISpritesheet): void {
		triggerBlobDownload(sheet.image.data, sheet.image.name)
	}

	function downloadJson(sheet: ISpritesheet): void {
		triggerBlobDownload(new Blob([sheet.json.content], { type: 'application/json' }), sheet.json.name)
	}

	function triggerBlobDownload(blob: Blob, filename: string): void {
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		link.remove()
		setTimeout(() => URL.revokeObjectURL(url), 4000)
	}

	function reset(): void {
		spritesheets.value = []
		hasResults.value = false
		error.value = null
		processing.value = false
		progress.value = { current: 0, total: 0, stage: '', fileName: '' }
	}

	return {
		spritesheets,
		processing,
		hasResults,
		progress,
		error,
		zipping,
		convert,
		downloadZip,
		downloadSheet,
		downloadJson,
		reset,
	}
}
