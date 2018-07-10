/* eslint-disable */
import React from 'react';
import { remote } from 'electron';
import fs from 'fs';
import path from 'path';
import player from 'render-media';
import toBlobURL from 'stream-to-blob-url';
import FileRender from 'component/fileRender';
import Thumbnail from 'component/common/thumbnail';
import LoadingScreen from 'component/common/loading-screen';

class VideoPlayer extends React.PureComponent {
  static MP3_CONTENT_TYPES = ['audio/mpeg3', 'audio/mpeg'];
  static FILE_MEDIA_TYPES = ['3D-file', 'e-book', 'comic-book'];

  constructor(props) {
    super(props);

    this.state = {
      hasMetadata: false,
      startedPlaying: false,
      unplayable: false,
      fileSource: null,
    };

    this.togglePlayListener = this.togglePlay.bind(this);
    this.toggleFullScreenVideo = this.toggleFullScreen.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const el = this.refs.media.children[0];
    if (!this.props.paused && nextProps.paused && !el.paused) el.pause();
  }

  componentDidMount() {
    const container = this.media;
    const { contentType, changeVolume, volume, position, claim } = this.props;

    const loadedMetadata = () => {
      this.setState({ hasMetadata: true, startedPlaying: true });
      this.media.children[0].play();
    };

    const renderMediaCallback = error => {
      if (error) this.setState({ unplayable: true });
    };

    // Handle fullscreen change for the Windows platform
    const win32FullScreenChange = () => {
      const win = remote.BrowserWindow.getFocusedWindow();
      if (process.platform === 'win32') {
        win.setMenu(document.webkitIsFullScreen ? null : remote.Menu.getApplicationMenu());
      }
    };

    // use renderAudio override for mp3
    if (VideoPlayer.MP3_CONTENT_TYPES.indexOf(contentType) > -1) {
      this.renderAudio(container, null, false);
    }
    // Render custom viewer: FileRender
    else if (this.fileType()) this.renderFile();
    // Render default viewer: render-media (video, audio, img, iframe)
    else {
      player.append(
        this.file(),
        container,
        { autoplay: true, controls: true },
        renderMediaCallback.bind(this)
      );
    }

    document.addEventListener('keydown', this.togglePlayListener);
    const mediaElement = this.media.children[0];
    if (mediaElement) {
      mediaElement.currentTime = position || 0;
      mediaElement.addEventListener('play', () => this.props.doPlay());
      mediaElement.addEventListener('pause', () => this.props.doPause());
      mediaElement.addEventListener('timeupdate', () =>
        this.props.savePosition(claim.claim_id, mediaElement.currentTime)
      );
      mediaElement.addEventListener('click', this.togglePlayListener);
      mediaElement.addEventListener('loadedmetadata', loadedMetadata.bind(this), {
        once: true,
      });
      mediaElement.addEventListener('webkitfullscreenchange', win32FullScreenChange.bind(this));
      mediaElement.addEventListener('volumechange', () => {
        changeVolume(mediaElement.volume);
      });
      mediaElement.volume = volume;
      mediaElement.addEventListener('dblclick', this.toggleFullScreenVideo);
    }
  }

  componentWillReceiveProps(next) {
    const el = this.media.children[0];
    if (!this.props.paused && next.paused && !el.paused) el.pause();
  }

  componentDidUpdate() {
    const { contentType, downloadCompleted } = this.props;
    const { startedPlaying } = this.state;

    if (this.playableType() && !startedPlaying && downloadCompleted) {
      const container = this.media.children[0];

      if (VideoPlayer.MP3_CONTENT_TYPES.indexOf(contentType) > -1) {
        this.renderAudio(this.media, true);
      } else {
        player.render(this.file(), container, {
          autoplay: true,
          controls: true,
        });
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.togglePlayListener);
    const mediaElement = this.media.children[0];
    if (mediaElement) {
      mediaElement.removeEventListener('click', this.togglePlayListener);
    }
    this.props.doPause();
  }

  toggleFullScreen(event) {
    const mediaElement = this.media.children[0];
    if (mediaElement) {
      if (document.webkitIsFullScreen) {
        document.webkitExitFullscreen();
      } else {
        mediaElement.webkitRequestFullScreen();
      }
    }
  }

  togglePlay(event) {
    // ignore all events except click and spacebar keydown, or input events in a form control
    if (
      event.type === 'keydown' &&
      (event.code !== 'Space' || event.target.tagName.toLowerCase() === 'input')
    ) {
      return;
    }
    event.preventDefault();
    const mediaElement = this.media.children[0];
    if (mediaElement) {
      if (!mediaElement.paused) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
    }
  }

  file() {
    const { downloadPath, filename } = this.props;

    return {
      name: filename,
      createReadStream: opts => fs.createReadStream(downloadPath, opts),
    };
  }

  playableType() {
    const { mediaType } = this.props;

    return ['audio', 'video'].indexOf(mediaType) !== -1;
  }

  supportedType() {
    // Files supported by render-media
    const { contentType, mediaType } = this.props;

    return Object.values(player.mime).indexOf(contentType) !== -1;
  }

  fileType() {
    // This files are supported using a custom viewer
    const { mediaType } = this.props;

    return VideoPlayer.FILE_MEDIA_TYPES.indexOf(mediaType) > -1;
  }

  renderFile() {
    // This is what render-media does with unplayable files
    const { filename, downloadPath, contentType, mediaType } = this.props;
    toBlobURL(fs.createReadStream(downloadPath), contentType, (err, url) => {
      if (err) {
        this.setState({ unsupported: true });
        return false;
      }
      // File to render
      const fileSource = {
        filePath: url,
        fileType: path.extname(filename).substring(1),
      };
      // Update state
      this.setState({ fileSource });
    });
  }

  renderAudio(container, autoplay) {
    if (container.firstChild) {
      container.firstChild.remove();
    }

    // clear the container
    const { downloadPath } = this.props;
    const audio = document.createElement('audio');
    audio.autoplay = autoplay;
    audio.controls = true;
    audio.src = downloadPath;
    container.appendChild(audio);
  }

  showLoadingScreen(isFileType, isPlayableType) {
    const { hasMetadata, unplayable, unsupported, fileSource } = this.state;

    const loader = {
      isLoading: false,
      loadingStatus: null,
    };

    // Loading message
    const noFileMessage = 'Waiting for blob.';
    const noMetadataMessage = 'Waiting for metadata.';

    // Error message
    const unplayableMessage = "Sorry, looks like we can't play this file.";
    const unsupportedMessage = "Sorry, looks like we can't preview this file.";

    // Files
    const isLoadingFile = !fileSource && isFileType;
    const isUnsupported = !this.supportedType() && isPlayableType && !isFileType;

    // Media (audio, video)
    const isUnplayable = isPlayableType && unplayable;
    const isLoadingMetadata = isPlayableType && (!hasMetadata && !unplayable);

    // Show loading message
    if (isLoadingFile || isLoadingMetadata) {
      loader.loadingStatus = isFileType ? noFileMessage : noMetadataMessage;
      loader.isLoading = true;

      // Show unsupported error message
    } else if (isUnsupported || isUnplayable) {
      loader.loadingStatus = isFileType ? unsupportedMessage : unplayableMessage;
    }

    return loader;
  }

  render() {
    const { mediaType } = this.props;
    const { fileSource } = this.state;

    const isFileType = this.fileType();
    const isFileReady = fileSource && isFileType;
    const isPlayableType = this.playableType();
    const { isLoading, loadingStatus } = this.showLoadingScreen(isFileType, isPlayableType);
    console.info(isLoading, loadingStatus);

    return (
      <React.Fragment>
        {loadingStatus && <LoadingScreen status={loadingStatus} spinner={isLoading} />}
        {isFileReady && <FileRender source={fileSource} mediaType={mediaType} />}
        <div
          className={'content__view--container'}
          style={{ opacity: isLoading ? 0 : 1 }}
          ref={container => {
            this.media = container;
          }}
        />
      </React.Fragment>
    );
  }
}

export default VideoPlayer;
/* eslint-disable */
