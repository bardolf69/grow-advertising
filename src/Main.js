var app = (function () {
    var uniqueIndex = 0;
  
    function generateUniqueIndex() {
      return uniqueIndex++;
    }
  
    function getValueOrDefault(value, defaultValue) {
      return typeof value !== 'undefined' ? value : defaultValue;
    }
  
    function register(eventName, callback) {
      document.addEventListener(eventName, callback);
    }
  
    function insertScriptBefore(source, target) {
      var script = document.createElement('script');
      script.src = source;
      target.parentNode.insertBefore(script, target);
    }
  
    function addBanner(bannerHtml) {
      var bannerContainer = document.getElementById('banner-container');
      if (bannerContainer) {
        bannerContainer.innerHTML += bannerHtml;
      }
    }
  
    function createBanner(options) {
      var bannerHtml = '<div class="banner" style="background-color: ' +
        getValueOrDefault(options.backgroundColor, '#ffffff') +
        '; color: ' + getValueOrDefault(options.textColor, '#000000') +
        ';">' + options.content + '</div>';
  
      return bannerHtml;
    }
  
    function showBanner(bannerHtml, targetElementId) {
      var targetElement = document.getElementById(targetElementId);
      if (targetElement) {
        targetElement.innerHTML += bannerHtml;
      }
    }
  
    function applyOptions(element, options) {
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          element.style[key] = options[key];
        }
      }
    }
  
    function bannerHtml(content, backgroundColor, textColor) {
      var bannerHtml = '<div class="banner" style="background-color: ' +
        getValueOrDefault(backgroundColor, '#ffffff') +
        '; color: ' + getValueOrDefault(textColor, '#000000') +
        ';">' + content + '</div>';
  
      return bannerHtml;
    }
  
    function stickyHtml(content, backgroundColor, textColor) {
      var stickyHtml = '<div class="sticky" style="background-color: ' +
        getValueOrDefault(backgroundColor, '#ffffff') +
        '; color: ' + getValueOrDefault(textColor, '#000000') +
        ';">' + content + '</div>';
  
      return stickyHtml;
    }
  
    function popUnder(content, backgroundColor, textColor) {
      var popUnderHtml = '<div class="popunder" style="background-color: ' +
        getValueOrDefault(backgroundColor, '#ffffff') +
        '; color: ' + getValueOrDefault(textColor, '#000000') +
        ';">' + content + '</div>';
  
      return popUnderHtml;
    }
  
    function pushNotification(content, backgroundColor, textColor) {
      var pushNotificationHtml = '<div class="push-notification" style="background-color: ' +
        getValueOrDefault(backgroundColor, '#ffffff') +
        '; color: ' + getValueOrDefault(textColor, '#000000') +
        ';">' + content + '</div>';
  
      return pushNotificationHtml;
    }
  
    function createIframe(src, options) {
      var iframe = document.createElement('iframe');
      iframe.src = src;
      applyOptions(iframe, options);
      document.body.appendChild(iframe);
  
      return iframe;
    }
  
    function removeIframe(iframe) {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  
    function iframeHtmlInterstitial(src, options) {
      var iframeHtml = '<iframe src="' + src + '" style="border: none;" ';
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          iframeHtml += key + '="' + options[key] + '" ';
        }
      }
      iframeHtml += '></iframe>';
  
      return iframeHtml;
    }
  
    function iframeHtmlExit(src, options) {
      var iframeHtml = '<iframe src="' + src + '" style="border: none;" ';
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          iframeHtml += key + '="' + options[key] + '" ';
        }
      }
      iframeHtml += '></iframe>';
  
      return iframeHtml;
    }
  
    function iframeHtml(src, options) {
      var iframeHtml = '<iframe src="' + src + '" style="border: none;" ';
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          iframeHtml += key + '="' + options[key] + '" ';
        }
      }
      iframeHtml += '></iframe>';
  
      return iframeHtml;
    }
  
    function fallbackHtml(content) {
      var fallbackHtml = '<div class="fallback">' + content + '</div>';
      return fallbackHtml;
    }
  
    function dispatchEvent(eventName, eventData) {
      var event = new CustomEvent(eventName, { detail: eventData });
      document.dispatchEvent(event);
    }
  
    return {
      generateUniqueIndex: generateUniqueIndex,
      getValueOrDefault: getValueOrDefault,
      register: register,
      insertScriptBefore: insertScriptBefore,
      addBanner: addBanner,
      createBanner: createBanner,
      showBanner: showBanner,
      applyOptions: applyOptions,
      bannerHtml: bannerHtml,
      stickyHtml: stickyHtml,
      popUnder: popUnder,
      pushNotification: pushNotification,
      createIframe: createIframe,
      removeIframe: removeIframe,
      iframeHtmlInterstitial: iframeHtmlInterstitial,
      iframeHtmlExit: iframeHtmlExit,
      iframeHtml: iframeHtml,
      fallbackHtml: fallbackHtml,
      dispatchEvent: dispatchEvent
    };
})();
  