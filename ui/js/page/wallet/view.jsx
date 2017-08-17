import React from "react";
import SubHeader from "component/subHeader";
import WalletBalance from "component/walletBalance";
import TransactionList from "component/transactionList";

const WalletPage = props => {
  return (
    <main className="main--single-column">
      <SubHeader />
      <WalletBalance />
      <TransactionList />
    </main>
  );
};

export default WalletPage;
