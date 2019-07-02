// @flow
import React from 'react';
import TransactionList from 'component/transactionList';

type Props = {
  fetchTransactions: () => void,
  fetchingTransactions: boolean,
  hasTransactions: boolean,
  transactions: Array<Transaction>,
  fetchMyClaims: () => void,
};

class TransactionListRecent extends React.PureComponent<Props> {
  componentDidMount() {
    const { fetchMyClaims, fetchTransactions } = this.props;

    // @if TARGET='app'
    fetchMyClaims();
    fetchTransactions();
    // @endif
  }

  render() {
    const { transactions } = this.props;
    return (
      <section className="card card__content">
        <TransactionList
          slim
          title={__('Recent Transactions')}
          transactions={transactions}
          emptyMessage={__("Looks like you don't have any recent transactions.")}
        />
      </section>
    );
  }
}

export default TransactionListRecent;
