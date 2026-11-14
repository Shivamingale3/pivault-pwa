// Applies the saved theme before first paint. Keep in sync with src/constants/theme.constants.ts.
// Kept as an external file (not inline) so the site's CSP can use script-src 'self'.
/* global document, matchMedia */
(function () {
  var theme = "system";
  try {
    var stored = localStorage.getItem("pivault:theme");
    if (stored === "light" || stored === "dark" || stored === "system") theme = stored;
  } catch {
    // Storage can be unavailable (private mode); fall back to the system theme.
  }
  var dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  var root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    .setAttribute("content", dark ? "#101215" : "#ffffff");
})();
