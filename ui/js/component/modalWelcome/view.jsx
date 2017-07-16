import React from "react";
import { Modal } from "component/modal";
import { CreditAmount } from "component/common";
import Link from "component/link";
import RewardLink from "component/rewardLink";

class ModalWelcome extends React.PureComponent {
  render() {
    const {
      closeModal,
      hasClaimed,
      isRewardApproved,
      reward,
      verifyAccount,
    } = this.props;

    return !hasClaimed
      ? <Modal type="custom" isOpen={true} contentLabel="Welcome to LBRY">
          <section>
            <h3 className="modal__header">{__("Welcome to LBRY.")}</h3>
            <p>
              {__(
                "Using LBRY is like dating a centaur. Totally normal up top, and"
              )}
              {" "}<em>{__("way different")}</em> {__("underneath.")}
            </p>
            <p>{__("Up top, LBRY is similar to popular media sites.")}</p>
            <p>
              {__(
                "Below, LBRY is controlled by users -- you -- via blockchain and decentralization."
              )}
            </p>
            <p>
              {__("Please have")} {" "}
              {reward &&
                <CreditAmount amount={parseFloat(reward.reward_amount)} />}
              {!reward && <span className="credit-amount">{__("??")}</span>}
              {" "} {__("as a thank you for building content freedom.")}
            </p>
            <div className="text-center">
              {isRewardApproved &&
                <RewardLink reward_type="new_user" button="primary" />}
              {!isRewardApproved &&
                <Link
                  button="primary"
                  onClick={verifyAccount}
                  label={__("Get Welcome Credits")}
                />}
              {!isRewardApproved &&
                <Link button="alt" onClick={closeModal} label={__("Skip")} />}
            </div>
          </section>
        </Modal>
      : <Modal
          type="alert"
          overlayClassName="modal-overlay modal-overlay--clear"
          isOpen={true}
          contentLabel={__("Welcome to LBRY")}
          onConfirmed={closeModal}
        >
          <section>
            <h3 className="modal__header">{__("About Your Reward")}</h3>
            <p>
              {__("You earned a reward of")}
              {" "}<CreditAmount amount={reward.reward_amount} label={false} />
              {" "}{__("LBRY credits, or")} <em>{__("LBC")}</em>.
            </p>
            <p>
              {__(
                "This reward will show in your Wallet momentarily, probably while you are reading this message."
              )}
            </p>
            <p>
              {__(
                "LBC is used to compensate creators, to publish, and to have say in how the network works."
              )}
            </p>
            <p>
              {__(
                "No need to understand it all just yet! Try watching or downloading something next."
              )}
            </p>
            <p>
              {__(
                "Finally, know that LBRY is an early beta and that it earns the name."
              )}
            </p>
          </section>
        </Modal>;
  }
}

export default ModalWelcome;
