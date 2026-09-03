export async function fileToArrayBuffer(file: File): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
		reader.onerror = () => reject(reader.error)
		reader.readAsArrayBuffer(file)
	})
}

export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
	let binaryString = ''
	const chunk = 0x8000
	for (let i = 0; i < uint8Array.length; i += chunk) {
		const slice = uint8Array.subarray(i, i + chunk)
		binaryString += String.fromCharCode.apply(null, slice as unknown as number[])
	}
	return btoa(binaryString)
}

export function formatBytes(bytes: number, decimals = 1): string {
	if (!bytes) return '0 B'
	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB']
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function sanitizeFileName(name: string): string {
	return name.replace(/\.gif$/i, '').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'sprite'
}
