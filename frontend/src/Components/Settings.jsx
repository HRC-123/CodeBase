import { useState } from "react";

const Settings = () => {

    const [lightmode, setLightMode] = useState(true);

    const handleLight = () => {
        setLightMode(!lightmode);
    }
    return (
      <div className="w-full">
        <div className="text-lg font-bold">Settings</div>
        <div
          className="w-full p-2 cursor-pointer font-semibold"
          onClick={() => handleLight()}
        >
          {lightmode === true ? (
            <button className="text-white bg-black w-full p-2 flex justify-between rounded border border-white">
              <div>Dark Mode</div>
              <div>🌙</div>
            </button>
          ) : (
            <button className="text-black bg-white w-full p-2 flex justify-between rounded border border-black">
              <div>Light Mode</div>
              <div>☀️</div>
            </button>
          )}
        </div>
      </div>
    );
}

export default Settings;