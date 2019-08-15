// @flow
import { Lbryio } from 'lbryinc';
import ReactGA from 'react-ga';
import { history } from './store';
// @if TARGET='app'
import ElectronCookies from '@exponent/electron-cookies';
// @endif

const isProduction = process.env.NODE_ENV === 'production';

type Analytics = {
  pageView: string => void,
  setUser: Object => void,
  toggle: (boolean, ?boolean) => void,
  apiLogView: (string, string, string, ?number, ?() => void) => void,
  apiLogPublish: () => void,
  tagFollowEvent: (string, boolean, string) => void,
};

let analyticsEnabled: boolean = true;
const analytics: Analytics = {
  pageView: path => {
    if (analyticsEnabled) {
      ReactGA.pageview(path);
    }
  },
  setUser: userId => {
    if (analyticsEnabled && userId) {
      ReactGA.event({
        category: 'User',
        action: 'userId',
        value: userId,
      });
    }
  },
  toggle: (enabled: boolean): void => {
    // Always collect analytics on lbry.tv
    // @if TARGET='app'
    analyticsEnabled = enabled;
    // @endif
  },
  apiLogView: (uri, outpoint, claimId, timeToStart) => {
    if (analyticsEnabled) {
      const params: {
        uri: string,
        outpoint: string,
        claim_id: string,
        time_to_start?: number,
      } = {
        uri,
        outpoint,
        claim_id: claimId,
      };

      // lbry.tv streams from AWS so we don't care about the time to start
      if (timeToStart && !IS_WEB) {
        params.time_to_start = timeToStart;
      }

      Lbryio.call('file', 'view', params);
    }
  },
  apiLogSearch: () => {
    if (analyticsEnabled && isProduction) {
      Lbryio.call('event', 'search');
    }
  },
  apiLogPublish: () => {
    if (analyticsEnabled && isProduction) {
      Lbryio.call('event', 'publish');
    }
  },
  apiSearchFeedback: (query, vote) => {
    if (isProduction) {
      // We don't need to worry about analytics enabled here because users manually click on the button to provide feedback
      Lbryio.call('feedback', 'search', { query, vote });
    }
  },
  tagFollowEvent: (tag, following, location) => {
    if (analyticsEnabled) {
      ReactGA.event({
        category: following ? 'Tag-Follow' : 'Tag-Unfollow',
        action: tag,
      });
    }
  },
  channelBlockEvent: (uri, blocked, location) => {
    if (analyticsEnabled) {
      ReactGA.event({
        category: blocked ? 'Channel-Hidden' : 'Channel-Unhidden',
        action: uri,
      });
    }
  },
};

// Initialize google analytics
// Set `debug: true` for debug info
// Will change once we have separate ids for desktop/web
const UA_ID = IS_WEB ? 'UA-60403362-12' : 'UA-60403362-13';

// @if TARGET='app'
ElectronCookies.enable({
  origin: 'https://lbry.tv',
});
// @endif

ReactGA.initialize(UA_ID, {
  testMode: process.env.NODE_ENV !== 'production',
  cookieDomain: 'auto',
});

// Manually call the first page view
// React Router doesn't include this on `history.listen`
// @if TARGET='web'
analytics.pageView(window.location.pathname + window.location.search);
// @endif

// @if TARGET='app'
ReactGA.set({ checkProtocolTask: null });
ReactGA.set({ location: 'https://lbry.tv' });
analytics.pageView(window.location.pathname.split('.html')[1] + window.location.search || '/');
// @endif;

// Listen for url changes and report
// This will include search queries
history.listen(location => {
  const { pathname, search } = location;

  const page = `${pathname}${search}`;
  analytics.pageView(page);
});

export default analytics;
