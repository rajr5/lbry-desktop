import React from 'react';
import { connect } from 'react-redux';
import { doUserEmailVerify, doUserPhoneVerify, doUserEmailVerifyFailure } from 'redux/actions/user';
import {
  selectEmailVerifyIsPending,
  selectEmailToVerify,
  selectPhoneToVerify,
  selectEmailVerifyErrorMessage,
} from 'redux/selectors/user';
import UserFieldVerify from './view';

const select = state => ({
  isPending: selectEmailVerifyIsPending(state),
  email: selectEmailToVerify(state),
  phone: selectPhoneToVerify(state),
  errorMessage: selectEmailVerifyErrorMessage(state),
});

const perform = dispatch => ({
  verifyUserEmail: (code, recaptcha) => dispatch(doUserEmailVerify(code, recaptcha)),
  verifyUserPhone: code => dispatch(doUserPhoneVerify(code)),
  verifyUserEmailFailure: error => dispatch(doUserEmailVerifyFailure(error)),
});

export default connect(select, perform)(UserFieldVerify);
