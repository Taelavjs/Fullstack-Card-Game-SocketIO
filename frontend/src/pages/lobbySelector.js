import './../App.css';

const LobbySelector = ({ roomInfo, setRoomName }) => {
  const { numPlayers, maxNumPlayers, hostName, roomTitle } = roomInfo;

  return (
  <>
    <div className="text-pastel-purple font-bold cellList" onClick={() => setRoomName()}>
      {roomTitle}
    </div>
    <div className="text-pastel-blue cellList" onClick={() => setRoomName()}>
      {hostName}
    </div>
    <div className="text-pastel-pink cellList" onClick={() => setRoomName()}>
      {numPlayers}/{maxNumPlayers}
    </div>
  </>
  );

}

export default LobbySelector;
