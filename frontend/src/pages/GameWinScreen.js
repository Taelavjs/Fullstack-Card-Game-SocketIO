

const GameWinScreen = ({winner}) => {


    return (
        <div className="absolute top-0 left-0 h-screen w-full bg-gradient-to-r from-pastel-pink via-pastel-blue to-pastel-purple overflow-hidden flex flex-col justify-center items-center">
            <div className="text-4xl font-bold text-white mb-6">{winner}</div>
            <button
            className="bg-pastel-pink text-white px-6 py-3 rounded-none hover:bg-pastel-pink-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={() => {
                window.location.reload();
            }}
            >
            Back To Menu
            </button>
        </div>
    )
}

export default GameWinScreen;