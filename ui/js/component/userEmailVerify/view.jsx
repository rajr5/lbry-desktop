import React from "react";
import Link from "component/link";
import { FormRow } from "component/form.js";

class UserEmailVerify extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      code: "",
    };
  }

  handleCodeChanged(event) {
    this.setState({
      code: event.target.value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.verifyUserEmail(this.state.code);
  }

  render() {
    const { errorMessage, isPending } = this.props;

    return (
      <form
        className="form-input-width"
        onSubmit={event => {
          this.handleSubmit(event);
        }}
      >
        <FormRow
          type="text"
          label="Verification Code"
          placeholder="a94bXXXXXXXXXXXXXX"
          name="code"
          value={this.state.code}
          onChange={event => {
            this.handleCodeChanged(event);
          }}
          errorMessage={errorMessage}
        />
        {/* render help separately so it always shows */}
        <div className="form-field__helper">
          <p>
            Email <Link href="mailto:help@lbry.io" label="help@lbry.io" /> if
            you did not receive or are having trouble with your code.
          </p>
        </div>
        <div className="form-row-submit form-row-submit--with-footer">
          <Link
            button="primary"
            label="Verify"
            disabled={this.state.submitting}
            onClick={event => {
              this.handleSubmit(event);
            }}
          />
        </div>
      </form>
    );
  }
}

export default UserEmailVerify;
