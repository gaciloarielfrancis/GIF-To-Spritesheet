export interface IResizedImage {
	image: string
	width: number
	height: number
}

/** Resolve target frame size, preserving aspect when one side is 0 (auto). */
export function resolveTargetSize(
	sourceWidth: number,
	sourceHeight: number,
	wantedWidth: number,
	wantedHeight: number,
): { width: number; height: number } {
	const aspect = sourceWidth / sourceHeight
	let newWidth = sourceWidth
	let newHeight = sourceHeight
	if (wantedWidth > 0 && wantedHeight === 0) {
		newWidth = wantedWidth
		newHeight = Math.max(1, Math.round(newWidth / aspect))
	} else if (wantedWidth === 0 && wantedHeight > 0) {
		newHeight = wantedHeight
		newWidth = Math.max(1, Math.round(newHeight * aspect))
	} else if (wantedWidth > 0 && wantedHeight > 0) {
		newWidth = wantedWidth
		newHeight = wantedHeight
	}
	return { width: Math.round(newWidth), height: Math.round(newHeight) }
}

export async function resizeImage(url: string, width: number, height: number): Promise<IResizedImage> {
	const { width: w, height: h } = await getImageSize(url).then((src) =>
		resolveTargetSize(src.width, src.height, width, height),
	)
	return drawToDataUrl(url, w, h)
}

function getImageSize(url: string): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height })
		img.onerror = () => reject(new Error('Failed to load frame image'))
		img.src = url
	})
}

function drawToDataUrl(url: string, width: number, height: number): Promise<IResizedImage> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = width
			canvas.height = height
			const ctx = canvas.getContext('2d')
			if (!ctx) {
				reject(new Error('Canvas 2D context unavailable'))
				return
			}
			ctx.imageSmoothingEnabled = true
			ctx.imageSmoothingQuality = 'high'
			ctx.clearRect(0, 0, width, height)
			ctx.drawImage(img, 0, 0, width, height)
			resolve({ image: canvas.toDataURL('image/png'), width, height })
		}
		img.onerror = () => reject(new Error('Failed to decode frame image'))
		img.src = url
	})
}
