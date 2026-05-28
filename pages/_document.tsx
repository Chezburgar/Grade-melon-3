import Document, { Html, Head, Main, NextScript } from "next/document";

// Runs before React hydrates so the user never sees a flash of light mode.
// Reads the same `theme` cookie the Toggle component writes, and defaults
// to dark mode when no preference exists.
const themeInitScript = `
(function() {
  try {
    var match = document.cookie.split('; ').find(function(r) { return r.indexOf('theme=') === 0; });
    var pref = match ? match.split('=')[1] : null;
    var isDark = pref === 'light' ? false : true;
    if (isDark) document.documentElement.classList.add('dark');
    // Apply persisted theme name early so colors don't flash either.
    var ts = localStorage.getItem('chezb-theme-settings');
    if (ts) {
      var parsed = JSON.parse(ts);
      if (parsed.theme) document.documentElement.setAttribute('data-theme', parsed.theme);
      if (parsed.fontSize) document.documentElement.setAttribute('data-fontsize', parsed.fontSize);
      if (parsed.density) document.documentElement.setAttribute('data-density', parsed.density);
    }
  } catch (e) {}
})();
`;

export default class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<link rel="manifest" href="/manifest.json" />
					<link rel="apple-touch-icon" href="/assets/icon.png" />
					<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
