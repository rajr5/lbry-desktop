// @flow
import React from 'react';
import Page from 'component/page';
import UserHistory from 'component/userHistory';

type Props = {};

class UserHistoryPage extends React.PureComponent<Props> {
  render() {
    return (
      <Page>
        <UserHistory />
      </Page>
    );
  }
}
export default UserHistoryPage;
