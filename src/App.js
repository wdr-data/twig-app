import React, { useCallback, useState, useRef, useEffect } from "react";
import moment from "moment";
import "moment-timezone";
import "moment/locale/de";
import htmlToImage from "html-to-image";
import classNames from "classnames";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Paper from "@material-ui/core/Paper";

import twitterLogo from "./images/Twitter_Logo_Blue.svg";
import appStyles from "./App.module.css";
import tweetStyles from "./Tweet.module.css";

moment.locale("de");

const baseUrl =
  "https://zvbwmhjkp7.execute-api.eu-central-1.amazonaws.com/staging/status/";

const replaceHtmlEnts = (text) =>
  text.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&");

const tokenizeTweet = (tweet) => {
  const entities = tweet.entities;
  const text = tweet.full_text;
  const codepoints = Array.from(text);

  const getSlice = (start, end) =>
    replaceHtmlEnts(codepoints.slice(start, end).join(""));

  const allEntities = [
    ...entities.hashtags.map((entity) => ({ ...entity, kind: "hashtag" })),
    ...entities.user_mentions.map((entity) => ({
      ...entity,
      kind: "user_mention",
    })),
    ...entities.urls.map((entity) => ({ ...entity, kind: "url" })),
    ...entities.symbols.map((entity) => ({ ...entity, kind: "symbol" })),
    ...codepoints
      .map((char, i) =>
        char === "\n" ? { kind: "break", indices: [i, i + 1] } : undefined
      )
      .filter((ent) => !!ent),
    ...(entities.media || []).map((entity) => ({ ...entity, kind: "media" })),
    { kind: "end", indices: [codepoints.length, codepoints.length] },
  ].sort((a, b) => a.indices[0] - b.indices[0]);

  const nodes = [];
  let currentIndex = 0;
  for (const entity of allEntities) {
    const [startIndex, endIndex] = entity.indices;

    // Check if there is regular text between the last entity and this one
    if (currentIndex !== startIndex) {
      nodes.push(
        <span key={nodes.length}>{getSlice(currentIndex, startIndex)}</span>
      );
    }

    if (entity.kind === "url") {
      nodes.push(
        <span key={nodes.length} className={tweetStyles.highlightText}>
          {entity.display_url}
        </span>
      );
    } else if (entity.kind === "break") {
      nodes.push(<br key={nodes.length} />);
    } else if (["media", "end"].includes(entity.kind)) {
      // Don't display media links
    } else {
      nodes.push(
        <span key={nodes.length} className={tweetStyles.highlightText}>
          {getSlice(startIndex, endIndex)}
        </span>
      );
    }

    currentIndex = endIndex;
  }

  return nodes;
};

function Tweet({ tweet }) {
  const tweetRef = useRef();
  const [image, setImage] = useState();

  useEffect(() => {
    const convertToImage = async () => {
      const dataUrl = await htmlToImage.toPng(tweetRef.current);
      setImage(dataUrl);
    };
    setTimeout(convertToImage, 1500);
  }, [tweet]);

  const hasMedia = tweet.entities && tweet.entities.media;

  const timestamp = (
    <span
      className={classNames(
        tweetStyles.timestamp,
        hasMedia && tweetStyles.timestampBelow
      )}
    >
      {moment(tweet.created_at).format("LT")} Uhr •{" "}
      {moment(tweet.created_at).format("LL")}
    </span>
  );

  return (
    <>
      <Paper className={appStyles.paper} elevation={8}>
        <Button
          className={appStyles.downloadButton}
          variant="contained"
          color="secondary"
          href={image}
          download={`${tweet.user.screen_name}_${moment()
            .tz("Europe/Berlin")
            .format("YYYY-MM-DD")}.png`}
          disabled={!image}
        >
          Download
        </Button>
        <div ref={tweetRef} className={tweetStyles.backgroundBlue}>
          <div className={tweetStyles.backgroundWhite}>
            <div className={tweetStyles.userContainer}>
              <img
                className={tweetStyles.userPhoto}
                src={tweet.user.profile_image_url_https}
              />
              <div className={tweetStyles.userNameContainer}>
                <span className={tweetStyles.userName}>{tweet.user.name}</span>
                <span className={tweetStyles.userScreenName}>
                  @{tweet.user.screen_name}
                </span>
              </div>
              <img className={tweetStyles.twitterLogo} src={twitterLogo} />
            </div>
            <p className={tweetStyles.text}>{tokenizeTweet(tweet)}</p>
            {!hasMedia && timestamp}
          </div>
          {hasMedia && (
            <div className={tweetStyles.imageContainer}>
              <img src={tweet.entities.media[0].media_url_https} />{" "}
            </div>
          )}
          {hasMedia && timestamp}
        </div>
      </Paper>
      {image && <img src={image} style={{ marginTop: "20px" }} />}
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
    <div className={appStyles.app}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" className={appStyles.pageTitle}>
            WDR Twitter Image Generator
          </Typography>
          <Button
            onClick={newTweetCallback}
            variant="contained"
            color="secondary"
          >
            Neuer Tweet
          </Button>
        </Toolbar>
      </AppBar>
      <div className={appStyles.content}>
        {tweet && <Tweet tweet={tweet} />}
      </div>
    </div>
  );
}

export default App;
