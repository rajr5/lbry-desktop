import * as ACTIONS from 'constants/action_types';
import * as MODALS from 'constants/modal_types';
import Lbryio from 'lbryio';
import { doOpenModal, doShowSnackBar } from 'redux/actions/app';
import { doClaimRewardType, doRewardList } from 'redux/actions/rewards';
import { selectEmailToVerify } from 'redux/selectors/user';
import rewards from 'rewards';

export function doFetchInviteStatus() {
  return dispatch => {
    dispatch({
      type: ACTIONS.USER_INVITE_STATUS_FETCH_STARTED,
    });

    Lbryio.call('user', 'invite_status')
      .then(status => {
        dispatch({
          type: ACTIONS.USER_INVITE_STATUS_FETCH_SUCCESS,
          data: {
            invitesRemaining: status.invites_remaining ? status.invites_remaining : 0,
            invitees: status.invitees,
          },
        });
      })
      .catch(error => {
        dispatch({
          type: ACTIONS.USER_INVITE_STATUS_FETCH_FAILURE,
          data: { error },
        });
      });
  };
}

export function doAuthenticate() {
  return dispatch => {
    dispatch({
      type: ACTIONS.AUTHENTICATION_STARTED,
    });
    Lbryio.authenticate()
      .then(user => {
        dispatch({
          type: ACTIONS.AUTHENTICATION_SUCCESS,
          data: { user },
        });
        dispatch(doRewardList());
        dispatch(doFetchInviteStatus());
      })
      .catch(error => {
        dispatch(doOpenModal(MODALS.AUTHENTICATION_FAILURE));
        dispatch({
          type: ACTIONS.AUTHENTICATION_FAILURE,
          data: { error },
        });
      });
  };
}

export function doUserFetch() {
  return dispatch => {
    dispatch({
      type: ACTIONS.USER_FETCH_STARTED,
    });
    Lbryio.getCurrentUser()
      .then(user => {
        dispatch(doRewardList());

        dispatch({
          type: ACTIONS.USER_FETCH_SUCCESS,
          data: { user },
        });
      })
      .catch(error => {
        dispatch({
          type: ACTIONS.USER_FETCH_FAILURE,
          data: { error },
        });
      });
  };
}

export function doUserFieldNew(email) {
  return dispatch => {
    dispatch({
      type: ACTIONS.USER_EMAIL_NEW_STARTED,
      email,
    });

    const success = () => {
      dispatch({
        type: ACTIONS.USER_EMAIL_NEW_SUCCESS,
        data: { email },
      });
      dispatch(doUserFetch());
    };

    const failure = error => {
      dispatch({
        type: ACTIONS.USER_EMAIL_NEW_FAILURE,
        data: { error },
      });
    };

    Lbryio.call('user_email', 'new', { email, send_verification_email: true }, 'post')
      .catch(error => {
        if (error.response && error.response.status === 409) {
          return Lbryio.call(
            'user_email',
            'resend_token',
            { email, only_if_expired: true },
            'post'
          ).then(success, failure);
        }
        throw error;
      })
      .then(success, failure);
  };
}

export function doUserFieldVerifyFailure(error) {
  return {
    type: ACTIONS.USER_EMAIL_VERIFY_FAILURE,
    data: { error },
  };
}

export function doUserFieldVerify(verificationToken, recaptcha) {
  return (dispatch, getState) => {
    const email = selectEmailToVerify(getState());

    dispatch({
      type: ACTIONS.USER_EMAIL_VERIFY_STARTED,
      code: verificationToken,
      recaptcha,
    });

    Lbryio.call(
      'user_email',
      'confirm',
      {
        verification_token: verificationToken,
        email,
        recaptcha,
      },
      'post'
    )
      .then(userEmail => {
        if (userEmail.is_verified) {
          dispatch({
            type: ACTIONS.USER_EMAIL_VERIFY_SUCCESS,
            data: { email },
          });
          dispatch(doUserFetch());
        } else {
          throw new Error('Your email is still not verified.'); // shouldn't happen
        }
      })
      .catch(error => dispatch(doUserFieldVerifyFailure(error)));
  };
}

export function doUserIdentityVerify(stripeToken) {
  return dispatch => {
    dispatch({
      type: ACTIONS.USER_IDENTITY_VERIFY_STARTED,
      token: stripeToken,
    });

    Lbryio.call('user', 'verify_identity', { stripe_token: stripeToken }, 'post')
      .then(user => {
        if (user.is_identity_verified) {
          dispatch({
            type: ACTIONS.USER_IDENTITY_VERIFY_SUCCESS,
            data: { user },
          });
          dispatch(doClaimRewardType(rewards.TYPE_NEW_USER));
        } else {
          throw new Error('Your identity is still not verified. This should not happen.'); // shouldn't happen
        }
      })
      .catch(error => {
        dispatch({
          type: ACTIONS.USER_IDENTITY_VERIFY_FAILURE,
          data: { error: error.toString() },
        });
      });
  };
}

export function doFetchAccessToken() {
  return dispatch => {
    const success = token =>
      dispatch({
        type: ACTIONS.FETCH_ACCESS_TOKEN_SUCCESS,
        data: { token },
      });
    Lbryio.getAuthToken().then(success);
  };
}

export function doUserInviteNew(email) {
  return dispatch => {
    dispatch({
      type: ACTIONS.USER_INVITE_NEW_STARTED,
    });

    Lbryio.call('user', 'invite', { email }, 'post')
      .then(() => {
        dispatch({
          type: ACTIONS.USER_INVITE_NEW_SUCCESS,
          data: { email },
        });

        dispatch(
          doShowSnackBar({
            message: __('Invite sent to %s', email),
          })
        );

        dispatch(doFetchInviteStatus());
      })
      .catch(error => {
        dispatch({
          type: ACTIONS.USER_INVITE_NEW_FAILURE,
          data: { error },
        });
      });
  };
}
