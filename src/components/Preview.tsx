import { ISpritesheet } from "../constants/Interfaces";

interface IPreview {
    sprites: ISpritesheet[]
}

const Preview = ({ sprites }: IPreview) => {

    return (
        <div className="grid gap-4 p-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {
                sprites.map((sprite: ISpritesheet, i: number) => (
                    <div key={ "preview-" + i }>
                        <div>{ sprite.image.name }</div>
                        <img className="max-full" src={ sprite.url } alt="preview" />
                    </div>
                    
                ))
            }
        </div>
    )
}

export default Preview;