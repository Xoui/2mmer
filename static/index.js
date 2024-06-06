const searchElement = document.getElementById('searchbar');
const urlInput = document.getElementById('address');

if (searchElement && urlInput) {
  searchElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const inputUrl = urlInput.value.trim();
      if (inputUrl.includes('now.gg')) {
        redirectToUrl(inputUrl, '/now.html'); 
      } else {
        redirectToUrl(inputUrl, '/go.html');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  });
} else {
  console.error('Search element or URL input not found');
}

function initializeServiceWorker() {
  try {
    return window.navigator.serviceWorker.register('./sw.js', {
      scope: __uv$config.prefix,
    });
  } catch (error) {
    console.error('Error registering service worker:', error);
  }
}

function redirectToUrl(value, path) {
  initializeServiceWorker().then(() => {
    try {
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
    } catch (error) {
      console.error('Error in redirectToUrl:', error);
    }
  }).catch(error => {
    console.error('Error in initializeServiceWorker promise:', error);
  });
}

function processValue(value) {
  try {
    handleUrl(value);
  } catch (error) {
    console.error('Error in processValue:', error);
  }
}

function validateUrl(val = '') {
  try {
    if (/^http(s?):\/\//.test(val) || (val.includes('.') && val.substr(0, 1) !== ' ')) return true;
    return false;
  } catch (error) {
    console.error('Error in validateUrl:', error);
    return false;
  }
}

function openWebPage(url) {
  window.navigator.serviceWorker
    .register("./sw.js", {
      scope: __uv$config.prefix,
    })
    .then(() => {
      try {
        if (!validateUrl(url)) url = getSearchEngineUrl() + url;
        else if (!(url.startsWith("https://") || url.startsWith("http://"))) url = "http://" + url;
        redirectToUrl(url, '/go.html');
      } catch (error) {
        console.error('Error in openWebPage:', error);
      }
    }).catch(error => {
      console.error('Error registering service worker in openWebPage:', error);
    });
}
