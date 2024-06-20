import { useEffect, useState } from 'react';

const SettingsSidebar = ({ isHost, match, gameStart, socket }) => {
  const [maxPlayers, setMaxPlayers] = useState('');
  const [minPlayers, setMinPlayers] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const handleSettingsUpdate = (obj) => {
      console.log("THIS RAN SETTINGS UPDATE");
      setSettings(obj);
      console.log("SETTINGS : ", obj); // Log the new settings
    };

    socket.on("settings_details", handleSettingsUpdate);

    return () => {
      socket.off("settings_details", handleSettingsUpdate);
    };
  }, [socket]);

  const handleCustomSettings = () => {
    console.log("button clicked");
    socket.emit("match-settings", { maxPlayers, minPlayers }, (cb) => {
      console.log("settings updated? ", cb);
    });
  };

  return (
    <>
      {match !== undefined && match.length > 0 && !gameStart && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-none shadow-md">
        {isHost && (
          <div className="space-y-4">
            <ul className="space-y-2">
              <li className="flex flex-col space-y-1">
                <label htmlFor="maxPlayers" className="text-gray-700">Max Number of Players:</label>
                <input
                  type="number"
                  id="maxPlayers"
                  name="maxPlayers"
                  defaultValue={settings ? settings.maxPlayers : 0}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  required
                  className="border border-gray-300 rounded-none px-2 py-1"
                />
              </li>
              <li className="flex flex-col space-y-1">
                <label htmlFor="minPlayers" className="text-gray-700">Min Number of Players:</label>
                <input
                  type="number"
                  id="minPlayers"
                  name="minPlayers"
                  defaultValue={settings ? settings.minPlayers : 0}
                  onChange={(e) => setMinPlayers(e.target.value)}
                  required
                  className="border border-gray-300 rounded-none px-2 py-1"
                />
              </li>
            </ul>
            <button
              onClick={handleCustomSettings}
              className="bg-pastel-blue text-white px-4 py-2 rounded-none hover:bg-pastel-blue-dark transition duration-300 shadow-md"
            >
              Submit
            </button>
          </div>)}
          <div className='flex flex-row space-x-2'>
            <div className="text-gray-700">Max Players: </div>
            <div className="text-pastel-blue-dark">{settings?.maxPlayers}</div>
          </div>
          <div className='flex flex-row space-x-2'>
            <div className="text-gray-700">Min Players: </div>
            <div className="text-pastel-blue-dark">{settings?.minPlayers}</div>
          </div>
          <div className='flex flex-row space-x-2'>
            <div className="text-gray-700">Timer: </div>
            <div className="text-pastel-blue-dark">{settings?.timer}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default SettingsSidebar;
