export interface ISpritesheet {
    url: string
    json: {
        content: string
        name: string
    }
    image: {
        data: File
        name: string
        options: {
            base64: boolean
        }
    }
}
