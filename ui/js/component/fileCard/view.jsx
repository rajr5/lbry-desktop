import React from 'react';
import lbry from 'lbry.js';
import lbryuri from 'lbryuri.js';
import Link from 'component/link';
import {Thumbnail, TruncatedText,} from 'component/common';
import FilePrice from 'component/filePrice'
import UriIndicator from 'component/uriIndicator';

class FileCard extends React.Component {
  constructor(props) {
    super(props)
    this._fileInfoSubscribeId = null
    this._isMounted = null
    this._metadata = null
    this.state = {
      showNsfwHelp: false,
      isHidden: false,
    }
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.hideOnRemove) {
      this._fileInfoSubscribeId = lbry.fileInfoSubscribe(this.props.outpoint, this.onFileInfoUpdate);
    }
  }

  componentWillUnmount() {
    if (this._fileInfoSubscribeId) {
      lbry.fileInfoUnsubscribe(this.props.outpoint, this._fileInfoSubscribeId);
    }
  }

  onFileInfoUpdate(fileInfo) {
    if (!fileInfo && this._isMounted && this.props.hideOnRemove) {
      this.setState({
        isHidden: true
      });
    }
  }

  handleMouseOver() {
    this.setState({
      hovered: true,
    });
  }

  handleMouseOut() {
    this.setState({
      hovered: false,
    });
  }

  render() {
    if (this.state.isHidden) {
      return null;
    }

    const {
      metadata,
      isResolvingUri,
      navigate,
      hidePrice,
    } = this.props

    const uri = lbryuri.normalize(this.props.uri);
    const isConfirmed = !!metadata;
    const title = isConfirmed ? metadata.title : uri;
    const obscureNsfw = this.props.obscureNsfw && isConfirmed && metadata.nsfw;
    let description = ""
    if (isConfirmed) {
      description = metadata.description
    } else if (isResolvingUri) {
      description = "Loading..."
    } else {
      description = <span className="empty">This file is pending confirmation</span>
    }

    return (
      <section className={ 'card card--small card--link ' + (obscureNsfw ? 'card--obscured ' : '') } onMouseEnter={this.handleMouseOver.bind(this)} onMouseLeave={this.handleMouseOut.bind(this)}>
        <div className="card__inner">
          <Link onClick={() => navigate('/show', { uri })} className="card__link">
            <div className="card__title-identity">
              <h5 title={title}><TruncatedText lines={1}>{title}</TruncatedText></h5>
              <div className="card__subtitle">
                { !hidePrice ? <span style={{float: "right"}}><FilePrice uri={uri} /></span>  : null}
                <UriIndicator uri={uri} />
              </div>
            </div>
            {metadata &&
            <div className="card__media" style={{ backgroundImage: "url('" + metadata.thumbnail + "')" }}></div>
            }
            <div className="card__content card__subtext card__subtext--two-lines">
                <TruncatedText lines={2}>{description}</TruncatedText>
            </div>
          </Link>
          {this.state.showNsfwHelp && this.state.hovered
            ? <div className='card-overlay'>
             <p>
               This content is Not Safe For Work.
               To view adult content, please change your <Link className="button-text" onClick={() => navigate('settings')} label="Settings" />.
             </p>
           </div>
            : null}
        </div>
      </section>
    );
  }
}

export default FileCard
