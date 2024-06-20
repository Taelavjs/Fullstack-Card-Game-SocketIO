import { useEffect } from "react";


const LobbyReadyScreen = ({match, socket}) => {
    useEffect(() => {

    }, [socket])
    const readyUp = () => {
        socket.emit('ready');
      }



    return (
        <>
            <div className="relative h-screen w-full bg-gradient-to-b from-pastel-purple to-pastel-blue overflow-hidden">
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center text-3xl font-bold text-white">
                Players
            </div>
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex flex-col space-y-4 items-center">
                {match.map((playerName, index) => (
                <div key={index} className="bg-pastel-pink text-white px-6 py-3 rounded-none shadow-lg">
                    {playerName}
                </div>
                ))}
                <button
                onClick={readyUp}
                className="bg-pastel-purple text-white px-6 py-3 rounded-none hover:bg-pastel-purple-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
                >
                Ready?
                </button>
            </div>
            </div>
        </>
    )
}

export default LobbyReadyScreen;