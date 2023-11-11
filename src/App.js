export const app = {
    divClass: 'growjs-placement',
    initialized: false,
    logging: true,
    ads: [],
    banners: {},
    viewability: {},
    TRIGGERS: {
        TIMER: 'timer',
        CLICK: 'click',
        SCROLL: 'scroll',
    },
    EVENTS: {
        INIT: 'GrowJsOnInit',
        LOAD: 'GrowJsOnLoad',
    },
    defaults: {
        interstitialDelay: 30000,
        trigger: 'timer',
    },
  };
  
/**
 * Logs a message to the console if logging is enabled.
 *
 * @param {string} message - The message to be logged.
 */
export const logMessage = function (message) {
    if (app.logging && window.console && window.console.log) {
        console.log(message);
    }
};
  
/**
 * Initializes the app.
 */
app.init = function () {
  if (this.initialized) {
    return;
  }

  logMessage('Dispatching INIT event');
  app.dispatchEvent(document, app.EVENTS.INIT, {});

  this.initialized = true;
  this.ads = this.ads || [];

  app.viewability = new Viewability();
  app.viewability.initializeViewability();

  this.ads.push = this.register;

  logMessage('Registering ads');
  if (this.ads.length > 0) {
    this.ads.forEach(this.register);
  }
};

/**
 * Generate a unique index for the app.
 *
 * @return {number} The generated unique index.
 */
app.generateUniqueIndex = function () {
    let index = Math.random().toString(36).substring(2);

    while (this.ads[index]) {
        logMessage('Duplicate index found, generating new index');
        index = Math.random().toString(36).substring(2);
    }
    
    logMessage('Generated unique index:', index);

    return index;
};
  
/**
 * Returns the value if it is defined, otherwise returns the default value.
 *
 * @param {any} value - The value to check.
 * @param {string} name - The name of the default value.
 * @return {any} The value if it is defined, otherwise the default value.
 */
app.getValueOrDefault = function (value, name) {
    logMessage('value:', value);
    logMessage('name:', name);
    
    const defaultValue = app.defaults[name];
    const result = typeof value === 'undefined' ? defaultValue : value;
  
    logMessage('result:', result);
    return result;
};
  
/**
 * Register a handler function for a given node.
 * 
 * @param {Object} options - The options object.
 * @param {Function} options.handler - The handler function.
 * @param {Object} options.node - The node object.
 * @returns {*} - The result of the handler function or null.
 */
app.register = function (options) {
    // Check if the handler is a function
    if (typeof options.handler === 'function') {
        logMessage('Handler function is being called.');
        // Call the handler function with the node object
        const result = options.handler(options.node);
        logMessage('Handler function finished execution.');
        return result;
    } else {
        logMessage('Handler is not a function.');
        // Return null if the handler is not a function
        return null;
    }
};
  
  
/**
 * Inserts a script element before a given element in the DOM.
 *
 * @param {Element} beforeElement - The element before which the script should be inserted.
 * @param {string} src - The source URL of the script.
 * @returns {void}
 */
app.insertScriptBefore = function(beforeElement, src) {
  const script = document.createElement('script');
  logMessage(script);
  script.async = true;
  logMessage(script.async);
  script.type = 'text/javascript';
  logMessage(script.type);
  script.src = src;
  logMessage(script.src);

  beforeElement.parentElement.insertBefore(script, beforeElement);
  logMessage(beforeElement.parentElement);
};
  
/**
 * Adds a banner to the app.
 *
 * @param {Object} banner - The banner object to add.
 * @return {Object} The added banner.
 */
app.addBanner = function(banner) {
  logMessage(`GrowJs.addBanner(): ${banner.zone_id}`);
  
  this.banners[banner.index] = banner;
  
  banner.div_id += `_${banner.index}`;
  banner.div.setAttribute('id', banner.div_id);
  banner.div.setAttribute('data-index', banner.index);
  banner.div.setAttribute('data-zone-id', banner.zone_id);
  
  return banner;
};
  
app.createBanner = function (parent, zone_id, size, script_url, options) {
    var div = parent.querySelector('.' + this.divClass);
    if (div.hasAttribute('data-index')) {
      return this.banners[div.getAttribute('data-index')];
    }
    logMessage('GrowJs.createBanner()');
    var banner = new Banner(div, zone_id, this.generateUniqueIndex(), size, script_url, options);
  
    return this.addBanner(banner);
};
  
/**
 * Displays a banner based on the given index.
 *
 * @param {number} index - The index of the banner to be displayed.
 * @return {void} This function does not return a value.
 */
app.showBanner = function(index) {
  const banner = this.banners[index];

  if (!banner || banner.shown) {
    return;
  }

  const div = document.getElementById(banner.div_id);

  if (!div) {
    return;
  }

  logMessage('Banner element found:', div);

  div.addEventListener(app.EVENTS.LOAD, function(e) {
    app.viewability.addViewableEntity(this.id);
    const imageElement = e.detail.data.imageElement;

    if (!imageElement) {
      return;
    }

    app.applyOptions(div, banner);

    const viewableCallback = imageElement.getAttribute('viewable-callback');
    if (viewableCallback !== null) {
      div.setAttribute('viewable-callback', viewableCallback);
    }

    const trackingCallback = imageElement.getAttribute('tracking-callback');
    if (trackingCallback !== null) {
      div.setAttribute('tracking-callback', trackingCallback);
    }

    logMessage('Close button clicked:', document.querySelector(`#${banner.div_id} .gjs_close_b`));
    document.querySelector(`#${banner.div_id} .gjs_close_b`).addEventListener('click', function(e) {
      div.style.setProperty('display', 'none');
    });
  });

  logMessage('Inserting script before:', div);
  this.insertScriptBefore(div, banner.src);
  banner.shown = true;
};
  
  
/**
 * Applies options to the given div and banner.
 *
 * @param {HTMLElement} div - The div to apply options to.
 * @param {Banner} banner - The banner to apply options to.
 */
app.applyOptions = function(div, banner) {
    const options = banner.options;

    if (typeof options.sticky !== 'undefined') {
        // Set default banner position
        div.style.setProperty('bottom', '0');
        div.style.setProperty('position', 'fixed', 'important');

        if (typeof options.after_id !== 'undefined') {
            // Hide the div initially
            div.style.setProperty('display', 'none');
            const afterElement = document.getElementById(options.after_id);
            if (afterElement) {
                const bounds = afterElement.getBoundingClientRect();
                const topOffset = afterElement.offsetTop + bounds.height;
                div.style.setProperty('top', topOffset + 'px');
                div.style.removeProperty('bottom');

                // Show the div when scrolling past the afterElement
                _w.addEventListener('scroll', function() {
                    const y = _w.scrollY;
                    if (y >= topOffset) {
                        div.style.setProperty('display', 'block');
                    } else {
                        div.style.setProperty('display', 'none');
                    }
                });
            }
        }

        if (typeof options.align !== 'undefined') {
            switch (options.align) {
                case 'center':
                    div.style.setProperty(
                        'left',
                        `calc(50% - ${banner.size[0] / 2}px)`
                    );
                    break;
                case 'left':
                    div.style.setProperty('left', '0');
                    break;
                case 'right':
                default:
                    div.style.setProperty('right', '0');
                    break;
            }
        }

        div.style.setProperty('z-index', '9999');
    }

    // Apply custom CSS options
    if (typeof options.css !== 'undefined') {
        for (const prop in options.css) {
            div.style.setProperty(prop, options.css[prop]);
        }
    }

    logMessage("Options applied successfully");
};
  
  
/**
 * Generate the HTML for a banner and update the corresponding div element.
 *
 * @param {number} index - The index of the banner in the list.
 * @param {string} markup - The HTML markup for the banner.
 */
app.bannerHtml = function(index, markup) {
  logMessage('GrowJs.bannerHtml()');
  var banner = this.banners[index];

  if (banner === undefined) {
    logMessage('Banner not found. id: ' + index);
    return;
  }

  var div = document.getElementById(banner.div_id);

  if (div) {
    div.innerHTML = markup;

    var imageElement = div.querySelector('img');
    if (imageElement) {
      if (imageElement.complete) {
        app.dispatchEvent(div, this.EVENTS.LOAD, {
          banner: banner,
          imageElement: imageElement
        });
      } else {
        imageElement.addEventListener('load', function() {
          app.dispatchEvent(div, app.EVENTS.LOAD, {
            banner: banner,
            imageElement: imageElement
          });
        });
      }
    }
  }
};
  
  
/**
 * Generate a function comment for the given function body.
 *
 * @param {number} index - The index parameter.
 * @param {string} src - The src parameter.
 * @param {string} markup - The markup parameter.
 * @param {number} width - The width parameter.
 * @param {number} height - The height parameter.
 * @param {object} options - The options parameter.
 * @param {string} options.sticky - The sticky property of the options parameter.
 * @param {object} options.spacing - The spacing property of the options parameter.
 * @param {string} options.selector - The selector property of the options parameter.
 * @param {string} options.trigger - The trigger property of the options parameter.
 * @param {string} options.align - The align property of the options parameter.
 * @return {undefined} No return value.
 */
app.stickyHtml = function (index, src, markup, width, height, options) {
  logMessage('GrowJs.stickyHtml()');
  var iframeObject = this.createIframe(index, src, markup, width, height, options);
  var div = iframeObject.div;
  var banner = this.banners[index];
  var iframe = iframeObject.iframe;

  div.style.display = 'none';

  div.addEventListener(app.EVENTS.LOAD, function (e) {
    var iframe = e.detail.data.iframe;
    app.viewability.addViewableEntity(iframe.id);
  });

  iframe.addEventListener('load', function () {
    logMessage('Iframe loaded');

    const { sticky, spacing, selector, trigger, align } = options;

    if (typeof sticky !== 'undefined') {
      div.style.setProperty('position', 'fixed', 'important');

      const { top, bottom, right, left } = spacing || {};

      const topSpace = top || 0;
      const bottomSpace = bottom || 0;
      const rightSpace = right || 0;
      const leftSpace = left || 0;

      if (typeof sticky["vertical-align"] !== 'undefined') {
        switch (sticky["vertical-align"]) {
          case "top":
            div.style.setProperty('top', topSpace + 'px');
            break;
          case "bottom":
            div.style.setProperty('bottom', bottomSpace + 'px');
            break;
        }
      }

      if (typeof selector !== 'undefined' && typeof trigger !== 'undefined' &&
        trigger === app.TRIGGERS.SCROLL) {

        div.style.setProperty('display', 'none');
        var afterElement = document.querySelector(selector);

        if (afterElement) {
          var bounds = afterElement.getBoundingClientRect();
          var topOffset = afterElement.offsetTop + bounds.height;

          _w.addEventListener('scroll', function () {
            var y = _w.scrollY;
            if (y >= topOffset) {
              div.style.setProperty('display', 'block');
            } else {
              div.style.setProperty('display', 'none');
            }
          });
        }
      } else {
        div.style.display = 'block';
      }

      if (typeof align != 'undefined') {
        switch (align) {
          case 'center':
            var computedSpace = leftSpace - rightSpace;
            div.style.setProperty('left', 'calc(50% - ' + (banner.size[0] / 2) + 'px + ' + computedSpace + 'px)');
            break;
          case 'left':
            div.style.setProperty('left', leftSpace + 'px');
            break;
          case 'right':
          default:
            div.style.setProperty('right', rightSpace + 'px');
            break;
        }
      }

      div.style.setProperty('z-index', '9999');
    }

    if (isNaN(parseInt(height))) {
      iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
    }
    iframe.style.visibility = 'visible';
    app.dispatchEvent(div, app.EVENTS.LOAD, {
      iframe: iframe
    });
  });
};
  
  
/**
 * A function that pops open a new window when a specific banner is clicked.
 *
 * @param {number} index - The index of the banner in the banners array.
 * @param {string} url - The URL of the window to be opened.
 * @return {undefined} This function does not return a value.
 */
app.popunder = function(index, url) {
    logMessage('popunder()');
    var banner = this.banners[index];

    if (typeof(banner) === 'undefined') {
        logMessage('Banner not found. id: ' + index);
        return;
    }

    var clickListener = function(e) {
        document.removeEventListener('click', clickListener, false);
        logMessage('Opening window: ' + url);
        window.open(url, 'window');
        _w.focus();
    };

    document.addEventListener('click', clickListener);
};
  
/**
 * A function to handle push notifications.
 *
 * @param {number} index - The index of the notification.
 * @param {Object} data - The data associated with the notification.
 * @return {undefined} - This function does not return a value.
 */
app.pushNotification = function (index, data) {
    // The implementation of pushNotification is currently empty.
    // You can add your custom logic for push notifications here.
    // Example:
    logMessage('GrowJs.pushNotification()');
    logMessage('Index: ' + index);
    logMessage('Data: ' + JSON.stringify(data));
};
  
/**
 * Creates an iframe element and appends it to a specified div element.
 *
 * @param {number} index - The index of the banner in the banners array.
 * @param {string} src - The source URL for the iframe.
 * @param {string} markup - The markup content to be rendered inside the iframe.
 * @param {number} width - The width of the iframe element.
 * @param {number} height - The height of the iframe element.
 * @param {object} options - Additional options for the iframe element.
 * @return {object} An object containing the created div and iframe elements.
 */
app.createIframe = function (index, src, markup, width, height, options) {
    logMessage('GrowJs.createIframe()');

    const banner = this.banners[index];

    if (!banner) {
        logMessage('Banner not found. id: ' + index);
        return;
    }

    const div = document.getElementById(banner.div_id);

    if (!div) {
        logMessage('Div with id: ' + banner.div_id + ' not found');
        return;
    }

    div.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.id = 'growjs_placement_' + index + '_iframe';
    iframe.frameBorder = 0;
    iframe.scrolling = "no";
    iframe.noresize = "noresize";
    iframe.marginheight = 0;
    iframe.marginwidth = 0;
    iframe.height = height;
    iframe.width = width;
    iframe.style.visibility = 'hidden';

    if (options) {
        for (const i in options) {
            if (options[i] !== null) {
                iframe.setAttribute(i, options[i]);
            }
        }
    }

    if (typeof src === 'string') {
        iframe.src = src;
    }

    div.appendChild(iframe);
    div.style.background = 'none';
    div.parentElement.style.background = 'none';

    if (markup) {
        if (/msie/.test(navigator.userAgent.toLowerCase()) || _w.opera) {
            iframe.contentWindow.contents = markup;
            iframe.src = "javascript:window[\"contents\"]";
        } else {
            const content = iframe.contentDocument;
            content.open();
            content.write(markup);
            content.close();
        }
    }

    growAdsContainers.push(iframe);

    return {
        'div': div,
        'iframe': iframe
    };
};
  
  
/**
 * Removes an iframe element based on the given index.
 *
 * @param {number} index - The index of the iframe element to be removed.
 * @return {undefined} This function does not return a value.
 */
app.removeIframe = function(index) {
    var iframe = document.getElementById(`growjs_placement_${index}_iframe`);
    if (iframe) {
        logMessage('Removing iframe:', iframe);
        iframe.remove();
        logMessage('Iframe removed');
    } else {
        logMessage('Iframe not found');
    }
};
  
  
/**
 * A function that creates an HTML interstitial iframe element.
 *
 * @param {number} index - The index of the iframe.
 * @param {string} src - The source URL for the iframe.
 * @param {string} markup - The HTML markup for the iframe.
 * @param {number} width - The width of the iframe.
 * @param {number} height - The height of the iframe.
 * @param {object} options - Additional options for the iframe.
 * @return {void}
 */
app.iframeHtmlInterstitial = function (index, src, markup, width, height, options) {
    logMessage('GrowJs.iframeHtmlInterstitial()');

    var iframeObject = this.createIframe(index, src, markup, width, height, options);
    var div = iframeObject.div;
    var iframe = iframeObject.iframe;

    div.style.display = 'none';

    var trigger = app.getValueOrDefault(options.trigger, 'interstitialTrigger');

    iframe.addEventListener('load', function (loadEvent) {
        const applyIframeStyles = (iframe) => {
            iframe.style.cssText = `
                height: 100%;
                width: 100%;
                top: 0px;
                left: 0px;
                position: fixed;
                background: transparent;
                overflow: hidden;
                margin: 0px;
                border: none;
                z-index: 2147483647;
                vertical-align: middle;
                visibility: visible;
            `;
        }

        if (trigger === app.TRIGGERS.TIMER) {
            setTimeout(function () {
                applyIframeStyles(iframe);
                div.style.display = 'block';

                app.viewability.addViewableEntity(iframe.id, {'percentageToBeViewable': 1});
            }, app.getValueOrDefault(options.delay, 'interstitialDelay'));
        } else if (trigger === app.TRIGGERS.CLICK) {
            var elementsClass = options['trigger-class'];
            if (typeof elementsClass !== 'undefined') {
                var clickHandler = function (e) {
                    applyIframeStyles(iframe);
                    div.style.display = 'block';

                    app.viewability.addViewableEntity(iframe.id, {'percentageToBeViewable': 1});
                    this.removeEventListener('click', clickHandler, false);
                };
                _w.document.querySelector(elementsClass).addEventListener('click', clickHandler);
            }
        }
    });
};
  

/**
 * A function that creates an HTML onExit iframe element.
 *
 * @param {number} index - the index of the iframe
 * @param {string} src - the source of the iframe
 * @param {string} markup - the markup of the iframe
 * @param {number} width - the width of the iframe
 * @param {number} height - the height of the iframe
 * @param {object} options - additional options for the iframe
 * @return {undefined}
 */
app.iframeHtmlExit = function (index, src, markup, width, height, options) {
  logMessage('GrowJs.iframeHtmlExit()');

  var iframeObject = this.createIframe(index, src, markup, width, height, options);
  var div = iframeObject.div;
  var iframe = iframeObject.iframe;

  div.style.display = 'none';

  function handleMouseLeave(e) {
    logMessage('handleMouseLeave');
    iframe.style.height = '100%';
    iframe.style.width = '100%';
    iframe.style.top = '0px';
    iframe.style.left = '0px';
    iframe.style.position = 'fixed';
    iframe.style.background = 'transparent';
    iframe.style.overflow = 'hidden';
    iframe.style.margin = '0px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '2147483647';
    iframe.style.verticalAlign = 'middle';
    iframe.style.visibility = 'visible';
    div.style.display = 'block';

    app.viewability.addViewableEntity(iframe.id, {'percentageToBeViewable': 1});
    _w.document.removeEventListener('mouseleave', handleMouseLeave, false);
  }

  iframe.addEventListener('load', function (loadEvent) {
    logMessage('loadEvent');
    _w.document.addEventListener('mouseleave', handleMouseLeave);
  });
};
  
  
/**
 * A function that creates a HTML iframe element.
 *
 * @param {number} index - the index of the iframe
 * @param {string} src - the source of the iframe
 * @param {string} markup - the markup of the iframe
 * @param {number} width - the width of the iframe
 * @param {number} height - the height of the iframe
 * @param {object} options - additional options for the iframe
 */
app.iframeHtml = function(index, src, markup, width, height, options) {
  logMessage('GrowJs.iframeHtml()');
  var iframeObject = this.createIframe(index, src, markup, width, height, options);
  var div = iframeObject.div;
  var iframe = iframeObject.iframe;

  div.addEventListener(app.EVENTS.LOAD, function (e) {
    var iframe = e.detail.data.iframe;
    app.viewability.addViewableEntity(iframe.id);
  });

  iframe.addEventListener('load', function (e) {
    logMessage('Iframe loaded');

    if (isNaN(parseInt(height))) {
      iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
    }

    iframe.style.visibility = 'visible';
    app.dispatchEvent(div, app.EVENTS.LOAD, {
      iframe: iframe
    });

    iframe.removeEventListener('load', arguments.callee, false);
  });
};
  
  
/**
 * Fallbacks to HTML if the banner is not found and sets the innerHTML of a div with the given markup.
 *
 * @param {number} index - The index of the banner.
 * @param {string} markup - The HTML markup to set as innerHTML of the div.
 * @return {undefined} Returns nothing.
 */
app.fallbackHtml = function(index, markup) {
    var banner = this.banners[index];
    
    if (typeof banner === 'undefined') {
        logMessage('Banner not found. id: ' + index);
        return;
    }
    
    var div = document.getElementById(banner.div_id);
    if (typeof div === 'undefined' || !div) {
        logMessage('Div with id: ' + banner.div_id + ' not found');
        return;
    }
    
    logMessage('GrowJs.createIframe()');
    
    div.innerHTML = '';
    div.innerHTML = markup;
    
    var arr = div.getElementsByTagName('script');
    for (var n = 0; n < arr.length; n++) {
        nodeScriptReplace(arr[n]);
    }
    
    function nodeScriptReplace(node) {
        if (nodeScriptIs(node) === true) {
            node.parentNode.replaceChild(nodeScriptClone(node), node);
        } else {
            var i = -1, children = node.childNodes;
            while (++i < children.length) {
                nodeScriptReplace(children[i]);
            }
        }
    
        return node;
    }
    
    function nodeScriptClone(node) {
        var script = document.createElement("script");
        script.text = node.innerHTML;
    
        var i = -1, attrs = node.attributes, attr;
        while (++i < attrs.length) {
            script.setAttribute((attr = attrs[i]).name, attr.value);
        }
    
        return script;
    }
    
    function nodeScriptIs(node) {
        return node.tagName === 'SCRIPT';
    }
};
  
  
/**
 * Dispatches an event on a target element.
 *
 * @param {Object} target - The target element on which to dispatch the event.
 * @param {string} type - The type of the event to dispatch.
 * @param {any} data - The data to be included in the event's detail property.
 * @return {void} This function does not return a value.
 */
app.dispatchEvent = function (target, type, data) {
    logMessage(`GrowJs.dispatchEvent(): ${type}`);
    const detail = { data };
  
    const event = new CustomEvent(type, {
      detail,
      bubbles: true
    });
  
    target.dispatchEvent(event);
};
  
if (window.GrowJs) {
    app.ads = window.GrowJs.ads;
}
  
window.GrowJs = app;
app.init();