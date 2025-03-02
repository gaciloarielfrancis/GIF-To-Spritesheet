import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileToArrayBuffer } from "../utils/Arrays";
import { TBuffer } from "../constants/Types";

interface callback {
    extract(result: TBuffer[], width: number, height: number, quality: number, format: string): void
}

export default function Settings ({ extract }: callback) {

    const [ gifs, setGifs ] = useState<TBuffer[]>([]);
    const [ imageWidth, setImageWidth ] = useState<number>(0);
    const [ imageHeight, setImageHeight ] = useState<number>(0);
    const [ imageQuality, setImageQuality ] = useState<number>(100);
    const [ imageFormat, setImageFormat ] = useState<string>("png");

    const onDrop = useCallback((files: File[]) => {
		let total = files.reduce((c, f) => c + (f.type === "image/gif" ? 1 : 0), 0);
		const buffers: TBuffer[] = [];
		files.forEach(async (file: File) => {
			if(file.type === "image/gif") {
				FileToArrayBuffer(file).then((buffer: Uint8Array) => {
					total--;
					buffers.push({
						buffer: buffer,
						name: file.name.replace(".gif", "")
					});
					if(total === 0) setGifs(buffers);
				});
			}
		});
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    useEffect(() => {
        if(gifs.length > 0) extract(gifs, imageWidth, imageHeight, imageQuality, imageFormat);
    }, [ gifs, imageWidth, imageHeight, imageQuality, imageFormat ]);

    return (
        <header className="p-5">
            <h3 className="text-lg font-bold">Image Settings</h3>
            <div className="items-center justify-between mb-8 md:flex">
                <div className="mb-2">
                    <label className="mr-2">Size:</label>
                    <div className="inline-block float-right md:float-none">
                        <input onChange={ e => setImageWidth(Number(e.currentTarget.value)) } type="number" min="0" placeholder="Width" className="border-2 border-black rounded-sm px-2 w-32 mr-2" />
                        <input onChange={ e => setImageHeight(Number(e.currentTarget.value)) } type="number" min="0" placeholder="Height" className="border-2 border-black rounded-sm px-2 w-32" />
                    </div>
                </div>
                <div className="mb-2">
                    <label className="mr-2">Quality:</label>
                    <input onChange={ e => setImageQuality(Number(e.currentTarget.value)) } type="number" min="1" max="100" defaultValue="100" placeholder="Image Quality" 
                    className="border-2 border-black rounded-sm px-2 w-32 float-right md:float-none" />
                </div>
                <div className="mb-2">
                    <label className="mr-2">Format:</label>
                    <select onChange={ e => setImageFormat(e.currentTarget.value) } 
                    className="border-2 border-black bg-black text-white rounded-sm px-2 py-1 w-32 float-right md:float-none">
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WEBP</option>
                    </select>
                </div>
            </div>
            <div { ...getRootProps() } 
            className={ "max-w-[700px] w-full h-[200px] outline-4 outline-dashed outline-black rounded-md text-center p-5 m-auto flex items-center justify-center" + (isDragActive ? " outline-green-500 text-green-700" : "") }>
                <input { ...getInputProps() } accept="image/gif" />
                {
                    isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag and Drop GIF files here<br/>or<br/>Click to select files from your local</p>
                }
            </div>
        </header>
    )
}