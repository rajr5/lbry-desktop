// @flow
// Used as a wrapper for FormField to produce inline form elements
import * as React from 'react';
import classnames from 'classnames';

type Props = {
  children: React.Node,
  padded?: boolean,
  verticallyCentered?: boolean,
  stretch?: boolean,
  alignRight?: boolean,
};

export class FormRow extends React.PureComponent<Props> {
  static defaultProps = {
    padded: false,
  };

  render() {
    const { children, padded, verticallyCentered, stretch, alignRight } = this.props;
    return (
      <div
        className={classnames('form-row', {
          'form-row--padded': padded,
          'form-row--vertically-centered': verticallyCentered,
          'form-row--stretch': stretch,
          'form-row--right': alignRight,
        })}
      >
        {children}
      </div>
    );
  }
}

export default FormRow;
