export const THEME_STORAGE_KEY = "rustera:theme";

// Applied from <head> so the saved theme is on <html> before the first paint.
// Kept self-contained and dependency-free because it runs as an inline script.
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="dark"||t==="light"){var n=document.documentElement;n.classList.toggle("theme-dark",t==="dark");n.classList.toggle("theme-light",t==="light")}}catch(e){}})()`;
