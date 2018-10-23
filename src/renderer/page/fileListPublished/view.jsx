// @flow
import React from 'react';
import Button from 'component/button';
import FileList from 'component/fileList';
import Page from 'component/page';
import { PAGES } from 'lbry-redux';

type Props = {
  pendingPublishes: Array<{}>,
  claims: Array<{}>,
  checkIfPublishesConfirmed: (Array<{}>) => void,
  navigate: (string, ?{}) => void,
  fetching: boolean,
  sortBy: string,
};

class FileListPublished extends React.PureComponent<Props> {
  componentDidMount() {
    const { pendingPublishes, checkIfPublishesConfirmed } = this.props;
    if (pendingPublishes.length) {
      checkIfPublishesConfirmed(pendingPublishes);
    }
  }

  render() {
    const { fetching, claims, navigate, sortBy } = this.props;

    return (
      <Page notContained loading={fetching}>
        {claims && claims.length ? (
          <FileList
            checkPending
            fileInfos={claims}
            sortByHeight
            sortBy={sortBy}
            page={PAGES.PUBLISHED}
          />
        ) : (
          <div className="page__empty">
            <h3 className="card__title">
              {__("It looks like you haven't published anything to LBRY yet.")}
            </h3>
            <div className="card__actions card__actions--center">
              <Button
                button="primary"
                onClick={() => navigate('/publish')}
                label={__('Publish something new')}
              />
            </div>
          </div>
        )}
      </Page>
    );
  }
}

export default FileListPublished;
