

const PlayerListSidebar = ({match}) => {
    return (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-none shadow-md">
            {match?.map((playerName) => (
            <div key={playerName} className="text-pastel-blue-dark">{playerName}</div>
            ))}
        </div>
    )
}

export default PlayerListSidebar;