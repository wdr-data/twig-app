import React, { useCallback, useState } from "react";
import "./App.css";

function App() {
  const [tweet, setTweet] = useState();
  const newTweetCallback = useCallback(async () => {
    const response = await fetch(
      "https://zvbwmhjkp7.execute-api.eu-central-1.amazonaws.com/staging/status/1264239670973673474",
    );
    const tweet = await response.json();
    console.log(tweet);
    setTweet(tweet);
  }, []);
  return (
    <div className="App">
      <button onClick={newTweetCallback}>Neuer Tweet</button>
      <div>Preview</div>
      <button>Download</button>
    </div>
  );
}

export default App;
