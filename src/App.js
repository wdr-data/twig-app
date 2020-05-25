import React, { useCallback } from "react";
import "./App.css";

const twitterAuth = {
  token_type: "bearer",
  access_token: process.env.BEARER,
};

function App() {
  const newTweetCallback = useCallback(async () => {
    const headers = new Headers({
      Authorization: `Bearer ${twitterAuth.access_token}`,
    });
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/https://api.twitter.com/1.1/statuses/show/210462857140252672.json",
      {
        mode: "cors",
        headers,
      }
    );
    const tweet = await response.json();
    console.log(tweet);
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
