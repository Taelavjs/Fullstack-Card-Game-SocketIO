

const PlayerListSidebar = ({match}) => {
    return (
        <div className="h-full flex flex-col justify-center items-center">
            {match?.map((playerName) => (
                <div key={playerName} className="flex text-2xl items-center justify-center h-20 w-full text-teal-900 border-gray-300 rounded-lg">
                    {playerName}
                </div>
            ))}
        </div>

    )
}

export default PlayerListSidebar;