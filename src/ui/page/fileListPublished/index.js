import { connect } from 'react-redux';
import { selectIsFetchingClaimListMine, selectMyClaimsWithoutChannels } from 'lbry-redux';
import { doCheckPendingPublishes } from 'redux/actions/publish';
import FileListPublished from './view';

const select = state => ({
  claims: selectMyClaimsWithoutChannels(state),
  fetching: selectIsFetchingClaimListMine(state),
});

const perform = dispatch => ({
  checkPendingPublishes: () => dispatch(doCheckPendingPublishes()),
});

export default connect(
  select,
  perform
)(FileListPublished);
