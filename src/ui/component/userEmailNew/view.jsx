// @flow
import * as React from 'react';
import { FormField, Form, Submit } from 'component/common/form';
import { Lbryio } from 'lbryinc';

type Props = {
  cancelButton: React.Node,
  errorMessage: ?string,
  isPending: boolean,
  addUserEmail: string => void,
};

type State = {
  email: string,
};

class UserEmailNew extends React.PureComponent<Props, State> {
  constructor() {
    super();

    this.state = {
      email: '',
    };

    (this: any).handleSubmit = this.handleSubmit.bind(this);
    (this: any).handleEmailChanged = this.handleEmailChanged.bind(this);
  }

  handleEmailChanged(event: SyntheticInputEvent<*>) {
    this.setState({
      email: event.target.value,
    });
  }

  handleSubmit() {
    const { email } = this.state;
    const { addUserEmail } = this.props;
    addUserEmail(email);

    // @if TARGET='web'
    Lbryio.call('user_tag', 'edit', { add: 'lbrytv' });
    // @endif
  }

  render() {
    const { cancelButton, errorMessage, isPending } = this.props;

    return (
      <React.Fragment>
        <header className="card__header">
          <h2 className="card__title">{__("Don't Miss Out")}</h2>
          <p className="card__subtitle">
            {/* @if TARGET='app' */}
            {__("We'll let you know about LBRY updates, security issues, and great new content.")}
            {/* @endif */}
            {/* @if TARGET='web' */}
            {__(
              'Stay up to date with lbry.tv and be the first to know about the progress we make.'
            )}
            {/* @endif */}
          </p>
        </header>

        <Form className="card__content" onSubmit={this.handleSubmit}>
          <FormField
            type="email"
            label="Email"
            placeholder="youremail@example.org"
            name="email"
            value={this.state.email}
            error={errorMessage}
            onChange={this.handleEmailChanged}
            inputButton={<Submit label="Submit" disabled={isPending || !this.state.email} />}
          />
        </Form>
        <div className="card__actions">{cancelButton}</div>
        <p className="help">
          {__('Your email address will never be sold and you can unsubscribe at any time.')}
        </p>
      </React.Fragment>
    );
  }
}

export default UserEmailNew;
