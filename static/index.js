const searchElement = document.getElementById('searchbar');
const urlInput = document.getElementById('address');

if (searchElement && urlInput) {
  searchElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    const inputUrl = urlInput.value.trim();
    if (inputUrl.includes('now.gg')) {
      redirectToUrl(inputUrl, '/now.html'); 
    } else {
      redirectToUrl(inputUrl, '/go.html');
    }
  });
}

function initializeServiceWorker() {
  return window.navigator.serviceWorker.register('./sw.js', {
    scope: __uv$config.prefix,
  });
}

function redirectToUrl(value, path) {
  initializeServiceWorker().then(() => {
    let processedUrl = value.trim();
    if (!validateUrl(processedUrl)) processedUrl = 'https://www.google.com/search?q=' + processedUrl;
    else if (!(processedUrl.startsWith('https://') || processedUrl.startsWith('http://'))) processedUrl = 'https://' + processedUrl;

    if (processedUrl.includes('https://now.gg/') || processedUrl.includes('now.gg/')) {
      sessionStorage.setItem('GoUrl', __uv$config.encodeUrl(processedUrl));
      location.href = 'now.html';
    } else {
      sessionStorage.setItem('GoUrl', __uv$config.encodeUrl(processedUrl));

      if (path) {
        location.href = path;
      } else {
        window.location.href = __uv$config.prefix + __uv$config.encodeUrl(processedUrl);
      }
    }
  });
}

function processValue(value) {
  handleUrl(value);
}

function validateUrl(val = '') {
  if (/^http(s?):\/\//.test(val) || (val.includes('.') && val.substr(0, 1) !== ' ')) return true;
  return false;
}

function openWebPage(url) {
    window.navigator.serviceWorker
    .register("./sw.js", {
      scope: __uv$config.prefix,
    })
    .then(() => {
      if (!validateUrl(url)) url = getSearchEngineUrl() + url;
      else if (!(url.startsWith("https://") || url.startsWith("http://")))
        url = "http://" + url;

      
        redirectToUrl(url, '/go.html');
      
    });
};
