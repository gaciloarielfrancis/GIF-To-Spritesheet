type TImageSettings = {
    name: string
    width: number
    height: number
    format: string
    quality: number
}

export async function GenerateSpritesheet(frames: string[], props: TImageSettings, maxCols: number = 10) {
    return new Promise((resolve) => {
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = props.width * maxCols;
        canvas.height = Math.ceil(frames.length / maxCols) * props.height;
        let cols = 0, rows = 0, totalFrames = frames.length;

        const spriteData: object = {
            frames: {},
            meta: {
                author: "Ariel Francis Fernando Gacilo",
                image: props.name + "." + props.format,
                format: "RGBA8888",
                size: {
                    w: canvas.width,
                    h: canvas.height
                },
                scale: 1
            }
        }

        frames.forEach((frame: string, i: number) => {
            const img = new Image();
            const x = props.width * cols;
            const y = props.height * rows;
            img.src = frame;

            // @ts-ignore
            spriteData.frames[props.name + "-" + i] = {
                frame: { x: x, y: y, w: props.width, h: props.height },
                rotated: false,
                trimmed: false,
                spriteSourceSize: { x: 0, y: 0, w: props.width, h: props.height },
                sourceSize: { w: props.width, h: props.height }
            };

            img.onload = async () => {
                totalFrames--;
                ctx?.drawImage(img, x, y, props.width, props.height);
                if(totalFrames === 0) {
                    const url = await canvas.toDataURL("image/" + props.format, props.quality / 100);
                    canvas.toBlob(blob => {
                        const sheets = {
                            url: url,
                            json: {
                                name: props.name + ".json",
                                content: JSON.stringify(spriteData)
                            },
                            image: {
                                name: props.name + "." + props.format,
                                data: new File([ <BlobPart>blob ], props.name + "." + (props.format === "jpeg" ? ".jpg" : props.format), { type: "image/" + props.format }),
                                options: { base64: true }
                            }
                        };
                        resolve(sheets);
                    }, "image/" + props.format, props.quality / 100);
                };
            }
            cols++;
            if(cols === maxCols) {
                cols = 0;
                rows++;
            }
        });
    });	
}