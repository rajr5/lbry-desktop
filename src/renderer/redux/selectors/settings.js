import * as SETTINGS from 'constants/settings';
import { createSelector } from 'reselect';

const selectState = state => state.settings || {};

export const selectDaemonSettings = createSelector(selectState, state => state.daemonSettings);

export const selectClientSettings = createSelector(
  selectState,
  state => state.clientSettings || {}
);

export const makeSelectClientSetting = setting =>
  createSelector(selectClientSettings, settings => (settings ? settings[setting] : undefined));

// refactor me
export const selectShowNsfw = makeSelectClientSetting(SETTINGS.SHOW_NSFW);

export const selectLanguages = createSelector(selectState, state => state.languages || {});

export const selectTheme = makeSelectClientSetting(SETTINGS.THEME);
export const selectAutomaticDarkModeEnabled = makeSelectClientSetting(
  SETTINGS.AUTOMATIC_DARK_MODE_ENABLED
);
export const selectIsNight = createSelector(selectState, state => state.isNight);

export const selectThemePath = createSelector(
  selectTheme,
  selectAutomaticDarkModeEnabled,
  selectIsNight,
  (theme, automaticDarkModeEnabled, isNight) => {
    const dynamicTheme = automaticDarkModeEnabled && isNight ? 'dark' : theme;
    // return `${staticResourcesPath}/themes/${dynamicTheme || 'light'}.css`;
    return dynamicTheme || 'light';
  }
);

// TODO: I have no idea what I am doing
export const whatIsTheTheme = () =>
  selectAutomaticDarkModeEnabled || selectIsNight || selectTheme === 'dark' ? 'dark' : 'light';

export const selectosNotificationsEnabled = makeSelectClientSetting(
  SETTINGS.OS_NOTIFICATIONS_ENABLED
);
