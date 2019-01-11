// @flow
import React from 'react';
import { Modal } from 'modal/modal';
import { FormRow, FormField } from 'component/common/form';

type Props = {
  claimIsMine: boolean,
  closeModal: () => void,
  deleteFile: (string, boolean, boolean) => void,
  title: string,
  fileInfo: {
    outpoint: string,
  },
};

type State = {
  deleteChecked: boolean,
  abandonClaimChecked: boolean,
};

class ModalRemoveFile extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      deleteChecked: false,
      abandonClaimChecked: true,
    };

    (this: any).handleDeleteCheckboxClicked = this.handleDeleteCheckboxClicked.bind(this);
    (this: any).handleAbandonClaimCheckboxClicked = this.handleAbandonClaimCheckboxClicked.bind(
      this
    );
  }

  handleDeleteCheckboxClicked() {
    const { deleteChecked } = this.state;
    this.setState({
      deleteChecked: !deleteChecked,
    });
  }

  handleAbandonClaimCheckboxClicked() {
    const { abandonClaimChecked } = this.state;
    this.setState({
      abandonClaimChecked: !abandonClaimChecked,
    });
  }

  render() {
    const {
      claimIsMine,
      closeModal,
      deleteFile,
      fileInfo: { outpoint },
      title,
    } = this.props;
    const { deleteChecked, abandonClaimChecked } = this.state;

    return (
      <Modal
        isOpen
        contentLabel={__('Confirm File Remove')}
        type="confirm"
        confirmButtonLabel={__('Remove')}
        onConfirmed={() => deleteFile(outpoint, deleteChecked, abandonClaimChecked)}
        onAborted={closeModal}
      >
        <header className="card__header">
          <h2 className="card__title">{__('Remove File')}</h2>
          <p className="card__subtitle">
            {__("Are you sure you'd like to remove")} <cite>{`"${title}"`}</cite>{' '}
            {__('from the LBRY app?')}
          </p>
        </header>
        <section className="card__content">
          <FormRow>
            <FormField
              prefix={__('Also delete this file from my computer')}
              type="checkbox"
              checked={deleteChecked}
              onChange={this.handleDeleteCheckboxClicked}
            />
          </FormRow>
          {claimIsMine && (
            <FormRow>
              <FormField
                prefix={__('Abandon the claim for this URI')}
                type="checkbox"
                checked={abandonClaimChecked}
                onChange={this.handleAbandonClaimCheckboxClicked}
              />
            </FormRow>
          )}
        </section>
      </Modal>
    );
  }
}

export default ModalRemoveFile;
