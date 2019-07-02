// @flow
import React from 'react';
import Button from 'component/button';
import ClaimList from 'component/claimList';

type Props = {
  fetching: boolean,
  downloadedUris: Array<string>,
};

function FileListDownloaded(props: Props) {
  const { fetching, downloadedUris } = props;
  const hasDownloads = !!downloadedUris.length;

  return (
    // Removed the <Page> wapper to try combining this page with UserHistory
    // This should eventually move into /components if we want to keep it this way
    <React.Fragment>
      {hasDownloads ? (
        <div className="card">
          <ClaimList
            header={<h1>{__('Your Library')}</h1>}
            defaultSort
            persistedStorageKey="claim-list-downloaded"
            uris={downloadedUris}
            loading={fetching}
          />
        </div>
      ) : (
        <div className="main--empty">
          <section className="card card--section">
            <header className="card__header">
              <h2 className="card__title">{__("You haven't downloaded anything from LBRY yet.")}</h2>
            </header>

            <div className="card__content">
              <div className="card__actions card__actions--center">
                <Button button="primary" navigate="/" label={__('Explore new content')} />
              </div>
            </div>
          </section>
        </div>
      )}
    </React.Fragment>
  );
}

export default FileListDownloaded;
