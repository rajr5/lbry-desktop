// @flow
import React from 'react';
import { FormField, Form } from 'component/common/form';
import Button from 'component/button';
import ChannelSection from 'component/selectChannel';
import { parseURI } from 'lbry-redux';
import { usePersistedState } from 'util/use-persisted-state';

// props:
type Props = {
  uri: string,
  channelUri: string,
  createComment: params => {},
};

class CommentCreate extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      message: '',
    };
    // set state or props for comment form
    (this: any).handleCommentChange = this.handleCommentChange.bind(this);
    (this: any).handleChannelChange = this.handleChannelChange.bind(this);
    (this: any).handleSubmit = this.handleSubmit.bind(this);
  }

  handleCommentChange(event) {
    this.setState({ message: event.target.value });
  }

  handleChannelChange(channelUri) {
    this.setState({ channelUri: channelUri });
  }

  handleSubmit() {
    // const { createComment, claim, channelUri } = this.props;
    const { channelUri, claim } = this.props; // eslint-disable-line react/prop-types
    console.log('claim', claim);

    const { claim_id: claimId } = claim;
    const { message } = this.state;
    let cmt = { message, channelId: parseURI(channelUri).claimId, claimId };

    console.log('CMT', cmt);
    console.log('PURI', claimId);
    console.log('PURI', parseURI(channelUri));
  }

  render() {
    const { channelUri } = this.props;

    return (
      <section className="card card--section">
        {!acksComments && (
          <React.Fragment>
            <div className="media__title">
              <TruncatedText text={channelName || uri} lines={1} />
            </div>
            <div className="media__subtitle">
              {totalItems > 0 && (
                <span>
                  {totalItems} {totalItems === 1 ? 'publish' : 'publishes'}
                </span>
              )}
              {!isResolvingUri && !totalItems && <span>This is an empty channel.</span>}
            </div>
          </React.Fragment>
        )}
        <Form onSubmit={this.handleSubmit}>
          <div className="card__content">
            <FormField
              type="textarea"
              name="content_description"
              label={__('Text')}
              placeholder={__('Your comment')}
              value={this.state.message}
              onChange={this.handleCommentChange}
            />
          </div>
          <div className="card__actions--between">
            <div className="card__content">
              <ChannelSection channel={channelUri} />
            </div>
            <Button button="primary" type="submit" label={__('Post')} />
          </div>
        </Form>
      </section>
    );
  }
}

export default CommentCreate;
