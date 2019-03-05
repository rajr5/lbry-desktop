// @if TARGET='app'
import y18n from 'y18n';

const i18n = y18n({
  directory: `static/locales`.replace(/\\/g, '\\\\'),
  updateFiles: false,
  locale: 'en',
});
// @endif
// @if TARGET='web'
const i18n = {
  setLocale: () => {},
  getLocale: () => {},
};
// @endif

export default i18n;
