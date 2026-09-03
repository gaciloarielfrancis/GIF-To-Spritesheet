export interface ISpritesheetJson {
	content: string
	name: string
}

export interface ISpritesheetImage {
	data: File
	name: string
	options: {
		base64: boolean
	}
}

export interface ISpritesheetMeta {
	frameWidth: number
	frameHeight: number
	sheetWidth: number
	sheetHeight: number
	frameCount: number
	columns: number
	rows: number
	format: string
	sizeBytes: number
}

export interface ISpritesheet {
	url: string
	json: ISpritesheetJson
	image: ISpritesheetImage
	meta: ISpritesheetMeta
}

export type TBuffer = {
	buffer: Uint8Array
	name: string
	size: number
}

export type TFrame = {
	delay: number
	disposalMethod: number
	height: number
	image: HTMLCanvasElement
	interlaced: boolean
	leftPos: number
	localColourTableFlag: boolean
	time: number
	topPos: number
	transparencyIndex?: number
	width: number
}

export type TImageSettings = {
	name: string
	width: number
	height: number
	format: ImageFormat
	quality: number
}

export type ImageFormat = 'png' | 'jpeg' | 'webp'

export interface IConverterProgress {
	current: number
	total: number
	stage: string
	fileName: string
}
