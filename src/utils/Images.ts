export async function Resize(url: string, width: number, height: number) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas: HTMLCanvasElement = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const aspect = img.width / img.height;
            let newWidth = img.width, newHeight = img.height;
            if(width > 0 && height === 0) {
                newWidth = width;
                newHeight = newWidth / aspect;
            }else if(width === 0 && height > 0) {
                newHeight = height;
                newWidth = newHeight / aspect;
            }else if(width > 0 && height > 0) {
                newWidth = width;
                newHeight = height;
            }

            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx?.drawImage(img, 0, 0, newWidth, newHeight);

            resolve({
                image: canvas.toDataURL("image/png"),
                width: newWidth,
                height: newHeight
            });
        }
        img.src = url;
    });
}