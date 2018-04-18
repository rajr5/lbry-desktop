import { connect } from 'react-redux';
import * as settings from 'constants/settings';
import { selectCurrentModal, selectModalProps, selectModalsAllowed } from 'redux/selectors/app';
import {
  doOpenModal,
  selectCostForCurrentPageUri,
  selectBalance,
  selectCurrentPage,
} from 'lbry-redux';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import { selectUser, selectUserIsVerificationCandidate } from 'redux/selectors/user';

import ModalRouter from './view';

const select = (state, props) => ({
  balance: selectBalance(state),
  showPageCost: selectCostForCurrentPageUri(state),
  modal: selectCurrentModal(state),
  modalProps: selectModalProps(state),
  page: selectCurrentPage(state),
  isVerificationCandidate: selectUserIsVerificationCandidate(state),
  isCreditIntroAcknowledged: makeSelectClientSetting(settings.CREDIT_REQUIRED_ACKNOWLEDGED)(state),
  isEmailCollectionAcknowledged: makeSelectClientSetting(settings.EMAIL_COLLECTION_ACKNOWLEDGED)(
    state
  ),
  isWelcomeAcknowledged: makeSelectClientSetting(settings.NEW_USER_ACKNOWLEDGED)(state),
  user: selectUser(state),
  modalsAllowed: selectModalsAllowed(state),
});

const perform = dispatch => ({
  openModal: modal => dispatch(doOpenModal(modal)),
});

export default connect(select, perform)(ModalRouter);
