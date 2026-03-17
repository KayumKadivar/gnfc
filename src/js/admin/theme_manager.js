const themeKey = "gnfc_theme";

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
  }
}

const savedTheme = localStorage.getItem(themeKey) || "dark";

applyTheme(savedTheme);

window.toggleTheme = function () {
  const isLight = document.documentElement.classList.contains("light");

  const next = isLight ? "dark" : "light";

  localStorage.setItem(themeKey, next);

  applyTheme(next);
};
