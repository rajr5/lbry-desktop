const { remote } = require("electron");
import React from "react";
import { Thumbnail } from "component/common";
import player from "render-media";
import fs from "fs";
import { setSession, getSession } from "utils";
import LoadingScreen from "./loading-screen";

class VideoPlayer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasMetadata: false,
      startedPlaying: false,
      unplayable: false,
    };
  }

  componentDidMount() {
    const container = this.refs.media;
    const { mediaType } = this.props;
    const loadedMetadata = e => {
      this.setState({ hasMetadata: true, startedPlaying: true });
      this.refs.media.children[0].play();
    };
    const renderMediaCallback = err => {
      if (err) this.setState({ unplayable: true });
    };
    // Handle fullscreen change for the Windows platform
    const win32FullScreenChange = e => {
      const win = remote.BrowserWindow.getFocusedWindow();
      if ("win32" === process.platform) {
        win.setMenu(
          document.webkitIsFullScreen ? null : remote.Menu.getApplicationMenu()
        );
      }
    };

    player.append(
      this.file(),
      container,
      { autoplay: false, controls: true },
      renderMediaCallback.bind(this)
    );

    const mediaElement = this.refs.media.children[0];
    if (mediaElement) {
      mediaElement.addEventListener(
        "loadedmetadata",
        loadedMetadata.bind(this),
        {
          once: true,
        }
      );

      mediaElement.addEventListener(
        "webkitfullscreenchange",
        win32FullScreenChange.bind(this)
      );
      mediaElement.addEventListener("volumechange", () => {
        setSession("prefs_volume", mediaElement.volume);
      });
      mediaElement.volume = this.getPreferredVolume();
    }
  }

  getPreferredVolume() {
    const volumePreference = parseFloat(getSession("prefs_volume"));
    return isNaN(volumePreference) ? 1 : volumePreference;
  }

  componentDidUpdate() {
    const { mediaType, downloadCompleted } = this.props;
    const { startedPlaying } = this.state;

    if (this.playableType() && !startedPlaying && downloadCompleted) {
      const container = this.refs.media.children[0];

      player.render(this.file(), container, { autoplay: true, controls: true });
    }
  }

  file() {
    const { downloadPath, filename } = this.props;

    return {
      name: filename,
      createReadStream: opts => {
        return fs.createReadStream(downloadPath, opts);
      },
    };
  }

  playableType() {
    const { mediaType } = this.props;

    return ["audio", "video"].indexOf(mediaType) !== -1;
  }

  render() {
    const { mediaType, poster } = this.props;
    const { hasMetadata, unplayable } = this.state;
    const noMetadataMessage = "Waiting for metadata.";
    const unplayableMessage = "Sorry, looks like we can't play this file.";

    const needsMetadata = this.playableType();

    return (
      <div>
        {["audio", "application"].indexOf(mediaType) !== -1 &&
          (!this.playableType() || hasMetadata) &&
          !unplayable &&
          <Thumbnail src={poster} className="video-embedded" />}
        {this.playableType() &&
          !hasMetadata &&
          !unplayable &&
          <LoadingScreen status={noMetadataMessage} />}
        {unplayable &&
          <LoadingScreen status={unplayableMessage} spinner={false} />}
        <div ref="media" />
      </div>
    );
  }
}

export default VideoPlayer;
