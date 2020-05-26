import React, { useCallback, useState, useRef, useEffect } from "react";
import moment from "moment";
import "moment/locale/de";
import htmlToImage from "html-to-image";

import appStyles from "./App.module.css";
import tweetStyles from "./Tweet.module.css";

moment.locale("de");

const baseUrl =
  "https://zvbwmhjkp7.execute-api.eu-central-1.amazonaws.com/staging/status/";

function Tweet({ tweet }) {
  const tweetRef = useRef();
  const [image, setImage] = useState();

  useEffect(() => {
    const convertToImage = async () => {
      const dataUrl = await htmlToImage.toPng(tweetRef.current);
      setImage(dataUrl);
    };
    setTimeout(convertToImage, 500);
  }, [tweet]);

  return (
    <>
      <h2>Vorschau: </h2>

      <div ref={tweetRef} className={tweetStyles.backgroundBlue}>
        <div className={tweetStyles.backgroundWhite}>
          <div className={tweetStyles.userContainer}>
            <img src={tweet.user.profile_image_url_https} />
            <div className={tweetStyles.userNameContainer}>
              <span>{tweet.user.name}</span>
              <span>@{tweet.user.screen_name}</span>
            </div>
          </div>
          <p>{tweet.full_text}</p>
          <span>
            {moment(tweet.created_at).format("LT")} Uhr{" "}
            {moment(tweet.created_at).format("LL")}
          </span>
          <img src={tweet.entities.media[0].media_url_https} />
        </div>
      </div>
      {image && <img src={image} />}
      <button>Download</button>
    </>
  );
}

function App() {
  const [tweet, setTweet] = useState();

  const newTweetCallback = useCallback(async () => {
    const tweetUrl = prompt("Tweet-URL eingeben");
    if (!tweetUrl) {
      return;
    }
    const tweetId = tweetUrl.match(/\d*$/)[0];
    const response = await fetch(`${baseUrl}${tweetId}`);
    const tweet = await response.json();
    setTweet(tweet);
    console.log(tweet);
  }, []);

  return (
    <div className="App">
      <button onClick={newTweetCallback}>Neuer Tweet</button>
      {tweet && <Tweet tweet={tweet} />}
    </div>
  );
}

export default App;
