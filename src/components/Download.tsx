import JSZip from "jszip";
import { ISpritesheet } from "../constants/Interfaces";

interface IDownload {
    sprites: ISpritesheet[]
    onProcess(process: boolean): void
    onBack(): void
}

const Download = ({ sprites, onProcess, onBack }: IDownload) => {

    const downloadHandler = () => {
		if(sprites.length === 0) return;
        onProcess(true);
		const zip = new JSZip();
		sprites.forEach((sprite: ISpritesheet) => {
			zip.file(sprite.image.name, sprite.image.data, sprite.image.options);
			zip.file(sprite.json.name, sprite.json.content);
		});
		zip.generateAsync({ type:"blob" }).then((content: Blob) => {
			const link = document.createElement("a");
			link.href = URL.createObjectURL(content);
			link.download = "gif-to-spritesheets-" + new Date().getTime() + ".zip";
			link.click();
			link.remove();
			onProcess(false);
		});
	}

    return (
        <>
            {
                sprites.length > 0 ?
                    <div className="text-center my-4">
                        <button onClick={ onBack } type="button" 
                        className="cursor-pointer bg-white border-3 border-black text-black mx-auto px-4 py-2 mr-4 my-2 rounded-md hover:bg-gray-100">Upload Again</button>
                        <button onClick={ downloadHandler } type="button" 
                        className="cursor-pointer bg-black border-3 border-black text-white mx-auto px-4 py-2 rounded-md hover:bg-gray-700 hover:border-gray-700">Download All with Spritesheets Data</button>
                    </div>
                    
                : <></>
            }
        </>
    )
}

export default Download;