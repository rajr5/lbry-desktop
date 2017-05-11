import React from 'react'
import Router from 'component/router'
import Header from 'component/header';
import ErrorModal from 'component/errorModal'
import DownloadingModal from 'component/downloadingModal'
import UpgradeModal from 'component/upgradeModal'
import {Line} from 'rc-progress';

class App extends React.Component {
  componentWillMount() {
    document.addEventListener('unhandledError', (event) => {
      this.props.alertError(event.detail);
    });

    if (!this.props.upgradeSkipped) {
      this.props.checkUpgradeAvailable()
    }
  }

  render() {
    const {
      modal,
      headerLinks,
    } = this.props

    return <div id="window">
      <Header />
      <div id="main-content">
        <Router />
      </div>
      {modal == 'upgrade' && <UpgradeModal />}
      {modal == 'downloading' && <DownloadingModal />}
      {modal == 'error' && <ErrorModal />}
    </div>
  }
}

export default App
