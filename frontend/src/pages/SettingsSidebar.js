import { useEffect, useState } from 'react';

const SettingsSidebar = ({ isHost, match, gameStart, socket }) => {
  const [maxPlayers, setMaxPlayers] = useState('');
  const [minPlayers, setMinPlayers] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const handleSettingsUpdate = (obj) => {
      setSettings(obj);
    };

    socket.on("settings_details", handleSettingsUpdate);

    return () => {
      socket.off("settings_details");
    };
  }, []);

  const handleCustomSettings = () => {
    socket.emit("match-settings", { maxPlayers, minPlayers }, (cb) => {
      console.log("Settings updated? ", cb);
    });
  };

  return (
    <>
{match && match.length > 0 && !gameStart && (
  <div className="bg-white p-4 opacity-50">
    {isHost && (
      <div className="py-4">
        <label htmlFor="maxPlayers" className="text-gray-700">Max Number of Players:</label>
        <input
          type="number"
          id="maxPlayers"
          name="maxPlayers"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          required
          className="w-1/2 border border-b-6"
        />
        
        <label htmlFor="minPlayers" className="block text-gray-700">Min Number of Players:</label>
        <input
          type="number"
          id="minPlayers"
          name="minPlayers"
          value={minPlayers}
          onChange={(e) => setMinPlayers(e.target.value)}
          required
          className="w-1/2 border border-b-6"
        />
        
        <button
          onClick={handleCustomSettings}
          className=""
        >
          Submit
        </button>
      </div>
    )}

<div className="">
  <div className="text-gray-700">Max Players:</div>
      <div className="text-blue-500">{settings?.maxPlayers}</div>
    </div>
    <div className="mt-2">
      <div className="text-gray-700">Min Players:</div>
      <div className="text-blue-500">{settings?.minPlayers}</div>
    </div>
    <div className="mt-2">
      <div className="text-gray-700">Timer:</div>
      <div className="text-blue-500">{settings?.timer}</div>
    </div>
  </div>
)}

    </>
  );
}

export default SettingsSidebar;
