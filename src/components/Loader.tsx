import icon from "../assets/loading.gif";

interface ILoader {
    processing: boolean
}

const Loader = ({ processing }: ILoader) => {

    return (
        <>
            {
                processing ? 
                    <div className="fixed left-0 top-0 bg-[rgba(0,0,0,.5)] w-screen h-screen flex items-center justify-center">
                        <div className="text-center text-white">
                            <img className="w-20 h-20 mx-auto" src={ icon } alt="loading" />
                            <div>Please wait...</div>
                        </div>
                    </div>
                : <></>
            }
            
        </>
    )
}

export default Loader;