import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Settings from "./components/Settings";
import Download from "./components/Download";
import Preview from "./components/Preview";
import Loader from "./components/Loader";
import { ISpritesheet } from "./constants/Interfaces";
import { TBuffer, TFrame } from "./constants/Types";
import { Uint8ArrayToBase64 } from "./utils/Arrays";
import { Resize } from "./utils/Images";
import { GenerateSpritesheet } from "./utils/Spritesheet";
// @ts-ignore
import GIFUtils from "./utils/GIFUtils";

interface IResize {
	image: string
	width: number
	height: number
}

function App() {

	const [ spritesheets, setSpritesheets ] = useState<ISpritesheet[]>([]);
	const [ processing, setProcessing ] = useState<boolean>(false);
	const [ uploading, setUploading ] = useState<boolean>(true);

	const extractGif = async (buffers: TBuffer[], width: number, height: number, quality: number, format: string) => {
		setProcessing(true);
		setSpritesheets([]);

		let total = buffers.length;
		buffers.forEach((buffer: TBuffer) => {
			const frames: string[] = [];
			const imageURL: string = "data:image/gif;base64," + Uint8ArrayToBase64(buffer.buffer);

			const gif = GIFUtils();
			gif.load(imageURL);
			gif.onload = () => {
				const aspect = gif.width / gif.height;
				let newWidth = gif.width, newHeight = gif.height;
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

				gif.frames.forEach(async (frame: TFrame, i: number) => {
					const resizedImage = await Resize(frame.image.toDataURL('image/png'), newWidth, newHeight) as IResize;
					frames.push(resizedImage.image);
					if(i === gif.frames.length - 1) {
						await GenerateSpritesheet(frames, {
							name: buffer.name,
							width: resizedImage.width,
							height: resizedImage.height,
							quality: quality,
							format: format
						}).then(res => {
							total--;
							setSpritesheets((spritesheets: ISpritesheet[]) => [ ...spritesheets, ...[ res as ISpritesheet ] ]);
							if(total === 0) {
								setProcessing(false);
								setUploading(false);
							}
						})
						
					}
				});
			}
		})
	}

	useEffect(() => {
		if(spritesheets.length > 0 && !processing) {
			console.log(spritesheets)
		}
	}, [ spritesheets, processing ]);

	return (
		<div className="font-mono pb-[50px]">
			<Nav />
			{
				uploading ? 
				<Settings extract={ extractGif } /> : 
				<>
					<Download sprites={ spritesheets } onProcess={ (b: boolean) => setProcessing(b) } onBack={ () => setUploading(true) } />
					<Preview sprites={ spritesheets } />
				</>
			}
			<Footer />
			<Loader processing={ processing } />
		</div>
	)
}

export default App
