// @flow
import React from 'react';
import Button from 'component/button';
import { FormField, Form } from 'component/common/form';
import type { Claim } from 'types/claim';

type Props = {
  uri: string,
  title: string,
  claim: Claim,
  isPending: boolean,
  sendSupport: (number, string, string) => void,
  onCancel: () => void,
  sendTipCallback?: () => void,
  balance: number,
};

type State = {
  tipAmount: number,
  tipError: string,
};

class WalletSendTip extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      tipAmount: 0,
      tipError: '',
    };
    (this: any).handleSendButtonClicked = this.handleSendButtonClicked.bind(this);
  }

  handleSendButtonClicked() {
    const { claim, uri, sendSupport, sendTipCallback } = this.props;
    const { claim_id: claimId } = claim;
    const { tipAmount } = this.state;

    sendSupport(tipAmount, claimId, uri);

    // ex: close modal
    if (sendTipCallback) {
      sendTipCallback();
    }
  }

  handleSupportPriceChange(event: SyntheticInputEvent<*>) {
    const { balance } = this.props;
    const regexp = RegExp(/^(\d*([.]\d{0,8})?)$/);
    const validTipInput = regexp.test(event.target.value);
    const tipAmount = parseFloat(event.target.value);
    let tipError;

    if (!tipAmount) {
      tipError = __('Tip must be a number');
    } else if (tipAmount <= 0) {
      tipError = __('Tip must be a positive number');
    } else if (!validTipInput) {
      tipError = __('Tip must have no more than 8 decimal places');
    } else if (tipAmount === balance) {
      tipError = __('Please decrease your tip to account for transaction fees');
    } else if (tipAmount > balance) {
      tipError = __('Not enough credits');
    }

    this.setState({
      tipAmount,
      tipError,
    });
  }

  render() {
    const { title, isPending, uri, onCancel } = this.props;
    const { tipAmount, tipError } = this.state;

    return (
      <React.Fragment>
        <Form className="card__content">
          <FormField
            autoFocus
            name="tip-input"
            label={
              (tipAmount &&
                tipAmount !== 0 &&
                `Tip ${tipAmount.toFixed(8).replace(/\.?0+$/, '')} LBC`) ||
              __('Amount')
            }
            className="form-field--price-amount"
            error={tipError}
            min="0"
            step="any"
            type="number"
            placeholder="1.23"
            onChange={event => this.handleSupportPriceChange(event)}
            inputButton={
              <Button
                button="primary"
                label={__('Send')}
                disabled={isPending || tipError}
                onClick={this.handleSendButtonClicked}
              />
            }
            helper={
              <p>
                {__(`This will appear as a tip for "${title}".`)}{' '}
                <Button
                  label={__('Learn more')}
                  button="link"
                  href="https://lbry.com/faq/tipping"
                />
              </p>
            }
          />
        </Form>
        <div className="card__actions">
          <Button button="link" label={__('Cancel')} onClick={onCancel} navigateParams={{ uri }} />
        </div>
      </React.Fragment>
    );
  }
}

export default WalletSendTip;
