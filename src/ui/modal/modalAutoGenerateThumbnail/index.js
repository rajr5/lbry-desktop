import { connect } from 'react-redux';
import { doHideModal } from 'redux/actions/app';
import { doToast, doUploadThumbnail } from 'lbry-redux';
import fs from 'fs';
import ModalAutoGenerateThumbnail from './view';

const perform = dispatch => ({
  closeModal: () => dispatch(doHideModal()),
  upload: buffer => dispatch(doUploadThumbnail(null, buffer, null, fs)),
  showToast: options => dispatch(doToast(options)),
});

export default connect(
  null,
  perform
)(ModalAutoGenerateThumbnail);
