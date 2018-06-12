// @flow
import {
  ACTIONS,
  Lbry,
  selectMyClaimsWithoutChannels,
  doNotify,
  MODALS,
  selectMyChannelClaims,
  STATUSES,
  batchActions,
} from 'lbry-redux';
import { selectPendingPublishes } from 'redux/selectors/publish';
import type {
  UpdatePublishFormData,
  UpdatePublishFormAction,
  PublishParams,
} from 'redux/reducers/publish';
import fs from 'fs';
import path from 'path';

type Action = UpdatePublishFormAction | { type: ACTIONS.CLEAR_PUBLISH };
type PromiseAction = Promise<Action>;
type Dispatch = (action: Action | PromiseAction | Array<Action>) => any;
type GetState = () => {};

export const doClearPublish = () => (dispatch: Dispatch): Action =>
  dispatch({ type: ACTIONS.CLEAR_PUBLISH });

export const doUpdatePublishForm = (publishFormValue: UpdatePublishFormData) => (
  dispatch: Dispatch
): UpdatePublishFormAction =>
  dispatch({
    type: ACTIONS.UPDATE_PUBLISH_FORM,
    data: { ...publishFormValue },
  });

export const doResetThumbnailStatus = () => (dispatch: Dispatch): PromiseAction => {
  dispatch({
    type: ACTIONS.UPDATE_PUBLISH_FORM,
    data: {
      thumbnailPath: '',
    },
  });

  return fetch('https://spee.ch/api/channel/availability/@testing')
    .then(() =>
      dispatch({
        type: ACTIONS.UPDATE_PUBLISH_FORM,
        data: {
          uploadThumbnailStatus: STATUSES.READY,
          thumbnail: '',
          nsfw: false,
        },
      })
    )
    .catch(() =>
      dispatch({
        type: ACTIONS.UPDATE_PUBLISH_FORM,
        data: {
          uploadThumbnailStatus: STATUSES.API_DOWN,
          thumbnail: '',
          nsfw: false,
        },
      })
    );
};

export const doUploadThumbnail = (filePath: string, nsfw: boolean) => (dispatch: Dispatch) => {
  const thumbnail = fs.readFileSync(filePath);
  const fileExt = path.extname(filePath);

  const makeid = () => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 24; i += 1) text += possible.charAt(Math.floor(Math.random() * 62));
    return text;
  };

  const uploadError = (error = '') =>
    dispatch(
      batchActions(
        {
          type: ACTIONS.UPDATE_PUBLISH_FORM,
          data: { uploadThumbnailStatus: STATUSES.API_DOWN },
        },
        dispatch(doNotify({ id: MODALS.ERROR, error }))
      )
    );

  dispatch({
    type: ACTIONS.UPDATE_PUBLISH_FORM,
    data: { uploadThumbnailStatus: STATUSES.IN_PROGRESS },
  });

  const data = new FormData();
  const name = makeid();
  const blob = new Blob([thumbnail], { type: `image/${fileExt.slice(1)}` });
  data.append('name', name);
  data.append('file', blob);
  data.append('nsfw', nsfw.toString());
  return fetch('https://spee.ch/api/claim/publish', {
    method: 'POST',
    body: data,
  })
    .then(response => response.json())
    .then(
      json =>
        json.success
          ? dispatch({
              type: ACTIONS.UPDATE_PUBLISH_FORM,
              data: {
                uploadThumbnailStatus: STATUSES.COMPLETE,
                thumbnail: `${json.data.url}${fileExt}`,
              },
            })
          : uploadError('Upload failed')
    )
    .catch(err => uploadError(err.message));
};

export const doPrepareEdit = (claim: any, uri: string) => (dispatch: Dispatch) => {
  const {
    name,
    amount,
    channel_name: channelName,
    value: {
      stream: { metadata },
    },
  } = claim;

  const {
    author,
    description,
    // use same values as default state
    // fee will be undefined for free content
    fee = {
      amount: 0,
      currency: 'LBC',
    },
    language,
    license,
    licenseUrl,
    nsfw,
    thumbnail,
    title,
  } = metadata;

  const publishData = {
    name,
    channel: channelName,
    bid: amount,
    price: { amount: fee.amount, currency: fee.currency },
    contentIsFree: !fee.amount,
    author,
    description,
    fee,
    language,
    license,
    licenseUrl,
    nsfw,
    thumbnail,
    title,
    uri,
  };

  dispatch({ type: ACTIONS.DO_PREPARE_EDIT, data: publishData });
};

export const doPublish = (params: PublishParams) => (dispatch: Dispatch, getState: () => {}) => {
  const state = getState();
  const myClaims = selectMyClaimsWithoutChannels(state);
  const myChannels = selectMyChannelClaims(state);

  const {
    name,
    bid,
    filePath,
    description,
    language,
    license,
    licenseUrl,
    thumbnail,
    nsfw,
    channel,
    title,
    contentIsFree,
    price,
    uri,
    sources,
    isStillEditing,
  } = params;

  // get the claim id from the channel name, we will use that instead
  const namedChannelClaim = myChannels.find(myChannel => myChannel.name === channel);
  const channelId = namedChannelClaim ? namedChannelClaim.claim_id : '';
  const fee = contentIsFree || !price.amount ? undefined : { ...price };

  const metadata = {
    title,
    nsfw,
    license,
    licenseUrl,
    language,
    thumbnail,
  };

  if (fee) {
    metadata.fee = fee;
  }

  if (description) {
    metadata.description = description;
  }

  const publishPayload = {
    name,
    channel_id: channelId,
    bid,
    metadata,
  };

  if (filePath) {
    publishPayload.file_path = filePath;
  } else {
    publishPayload.sources = sources;
  }

  dispatch({ type: ACTIONS.PUBLISH_START });

  const success = () => {
    dispatch({
      type: ACTIONS.PUBLISH_SUCCESS,
      data: { pendingPublish: { ...publishPayload, isEdit: isStillEditing } },
    });
    dispatch(doNotify({ id: MODALS.PUBLISH }, { uri }));
    dispatch(doCheckPendingPublishes());
  };

  const failure = error => {
    dispatch({ type: ACTIONS.PUBLISH_FAIL });
    dispatch(doNotify({ id: MODALS.ERROR, error: error.message }));
  };

  return Lbry.publish(publishPayload).then(success, failure);
};

// Calls claim_list_mine until any pending publishes are confirmed
export const doCheckPendingPublishes = () => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const pendingPublishes = selectPendingPublishes(state);

  let publishCheckInterval;

  const checkFileList = () => {
    Lbry.claim_list_mine().then(claims => {
      const pendingPublishMap = {};
      pendingPublishes.forEach(({ name }) => {
        pendingPublishMap[name] = name;
      });

      claims.forEach(claim => {
        if (pendingPublishMap[claim.name]) {
          dispatch({
            type: ACTIONS.REMOVE_PENDING_PUBLISH,
            data: {
              name: claim.name,
            },
          });
          dispatch({
            type: ACTIONS.FETCH_CLAIM_LIST_MINE_COMPLETED,
            data: {
              claims,
            },
          });

          delete pendingPublishMap[claim.name];
        }
      });

      if (!pendingPublishes.length) {
        clearInterval(publishCheckInterval);
      }
    });
  };

  if (pendingPublishes.length) {
    checkFileList();
    publishCheckInterval = setInterval(() => {
      checkFileList();
    }, 10000);
  }
};
