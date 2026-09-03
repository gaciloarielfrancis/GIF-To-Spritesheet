import type { ISpritesheet, TImageSettings } from '../types'

interface ISpriteFrameEntry {
	frame: { x: number; y: number; w: number; h: number }
	rotated: boolean
	trimmed: boolean
	spriteSourceSize: { x: number; y: number; w: number; h: number }
	sourceSize: { w: number; h: number }
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Failed to load spritesheet frame'))
		img.src = src
	})
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode spritesheet'))),
			type,
			quality,
		)
	})
}

/**
 * Lay frames out left-to-right, top-to-bottom on a grid.
 * Output JSON matches the TexturePacker / PixiJS hash format used by the original app.
 */
export async function generateSpritesheet(
	frames: string[],
	props: TImageSettings,
	maxCols = 10,
): Promise<ISpritesheet> {
	if (frames.length === 0) throw new Error('No frames to pack')

	const columns = Math.max(1, Math.min(maxCols, frames.length))
	const rows = Math.ceil(frames.length / columns)

	const canvas = document.createElement('canvas')
	canvas.width = props.width * columns
	canvas.height = props.height * rows
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Canvas 2D context unavailable')
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	const spriteData: { frames: Record<string, ISpriteFrameEntry>; meta: Record<string, unknown> } = {
		frames: {},
		meta: {
			app: 'gif-to-spritesheet (Vue 3)',
			author: 'Ariel Francis Fernando Gacilo',
			image: `${props.name}.${props.format}`,
			format: 'RGBA8888',
			size: { w: canvas.width, h: canvas.height },
			scale: 1,
		},
	}

	const images = await Promise.all(frames.map((f) => loadImage(f)))
	images.forEach((img, i) => {
		const col = i % columns
		const row = Math.floor(i / columns)
		const x = props.width * col
		const y = props.height * row
		ctx.drawImage(img, x, y, props.width, props.height)
		spriteData.frames[`${props.name}-${i}`] = {
			frame: { x, y, w: props.width, h: props.height },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: props.width, h: props.height },
			sourceSize: { w: props.width, h: props.height },
		}
	})

	const mime = `image/${props.format}`
	const quality = props.format === 'png' ? undefined : props.quality / 100
	const url = canvas.toDataURL(mime, quality)
	const blob = await canvasToBlob(canvas, mime, quality ?? 1)
	const ext = props.format === 'jpeg' ? 'jpg' : props.format

	return {
		url,
		json: {
			name: `${props.name}.json`,
			content: JSON.stringify(spriteData, null, 2),
		},
		image: {
			name: `${props.name}.${ext}`,
			data: new File([blob], `${props.name}.${ext}`, { type: mime }),
			options: { base64: true },
		},
		meta: {
			frameWidth: props.width,
			frameHeight: props.height,
			sheetWidth: canvas.width,
			sheetHeight: canvas.height,
			frameCount: frames.length,
			columns,
			rows,
			format: props.format,
			sizeBytes: blob.size,
		},
	}
}
