// @flow
import * as React from 'react';
import classnames from 'classnames';
import HappyYrbl from './gerbil-happy.png';
import SadYrbl from './gerbil-sad.png';

type Props = {
  title?: string,
  subtitle?: string | React.Node,
  type: string,
  className?: string,
};

const yrblTypes = {
  happy: HappyYrbl,
  sad: SadYrbl,
};

export default class extends React.PureComponent<Props> {
  static defaultProps = {
    type: 'happy',
  };

  render() {
    const { title, subtitle, type, className } = this.props;

    const image = yrblTypes[type];

    return (
      <div className="yrbl-wrap">
        <img
          alt="Friendly gerbil"
          className={classnames('yrbl', className)}
          src={
            // If we don't use a leading `/` @reach/router will try to append the src url to the existing web url
            `/${image}`
          }
        />
        {title && subtitle && (
          <div className="card__content">
            <h2 className="card__title">{title}</h2>
            <div className="card__subtitle">{subtitle}</div>
          </div>
        )}
      </div>
    );
  }
}
