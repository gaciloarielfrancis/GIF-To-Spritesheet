export type TBuffer = {
    buffer: Uint8Array
    name: string
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
    transparencyIndex: number
    width: number
}

export type TImageSettings = {
    name: string
    width: number
    height: number
    format: string
    quality: number
}