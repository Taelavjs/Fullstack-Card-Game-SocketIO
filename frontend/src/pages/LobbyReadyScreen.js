import { useEffect } from "react";


const LobbyReadyScreen = ({match, socket}) => {
    useEffect(() => {

    }, [socket])
    const readyUp = () => {
        socket.emit('ready');
      }



    return (
<>
<div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center text-3xl font-bold text-white">
                Cards
            </div>
<div className="relative h-full w-full overflow-hidden flex flex-col justify-center  items-center">

<div className="relative mt-20 flex flex-col items-center justify-center h-full w-full md:h-1/4">
    {match.map((playerName, index) => (
        <div key={index} className=" min-width-10ch bg-pastel-pink text-white my-4 px-6 py-3 rounded-none shadow-lg mb-2 w-1/3 text-center">
            {playerName}
        </div>
    ))}
    <button
        onClick={readyUp}
        className="bg-pastel-purple my-4 text-white px-6 py-3 rounded-none hover:bg-pastel-purple-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105 mt-4"
    >
        Ready?
    </button>
</div>

</div>

</>

    )
}

export default LobbyReadyScreen;