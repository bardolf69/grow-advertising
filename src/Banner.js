// banner.js
import { CustomEventPolyfill } from './custom-event.js';

export class Banner {
  constructor(div, zone_id, index, size, src, options) {
    this.zone_id = zone_id;
    this.index = index;
    this.size = size;
    this.options = options || {};
    this.shown = false;
    this.src = null;
    this.div = div;
    this.div_id = 'growjs-placement_' + this.zone_id;

    this.init();
  }

  init() {
    logMessage('Banner.init(). Index: ' + this.index);
    this.src = 'https://financialnews.growadvertising.com/a?zoneId=' + this.zone_id + '&i=' + this.index;

    const params = [];
    if (this.options && Object.keys(this.options).length > 0) {
      for (let key in this.options) {
        if (Object.prototype.toString.call(this.options[key]) === '[object Array]') {
          for (let arrayKey in this.options[key]) {
            params.push(key + '[]=' + this.options[key][arrayKey]);
          }
        } else {
          params.push(key + '=' + this.options[key]);
        }
      }

      this.src = this.src + '&' + params.join('&');
    }
  }

  // Additional method to update banner options
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.init(); // Re-initialize with updated options
  }

  // Additional method to toggle banner visibility
  toggleVisibility() {
    logMessage('Banner.toggleVisibility(). Index: ' + this.index);
    this.shown = !this.shown;
    this.div.style.display = this.shown ? 'block' : 'none';
  }

  // Additional property to get the banner URL
  get bannerUrl() {
    return this.src;
  }

  // Original method from the original code
  showBanner() {
    logMessage('GrowJs.showBanner()');

    if (typeof (this) === 'undefined') {
      logMessage('Banner not found');

      return;
    }

    if (this.shown) {
      logMessage('Banner already shown');

      return;
    }

    var div = document.getElementById(this.div_id);

    if (!div) {
      return;
    }

    div.addEventListener(app.EVENTS.LOAD, function (e) {
      app.viewability.addViewableEntity(this.id);
      var imageElement = e.detail.data.imageElement;

      if (imageElement) {
        app.applyOptions(div, this);
        if (imageElement.getAttribute('viewable-callback') !== null) {
          div.setAttribute('viewable-callback', imageElement.getAttribute('viewable-callback'));
        }

        if (imageElement.getAttribute('tracking-callback') !== null) {
          div.setAttribute('tracking-callback', imageElement.getAttribute('tracking-callback'));
        }
        document.querySelector('#' + this.div_id + ' .gjs_close_b').addEventListener('click', function (e) {
          div.style.setProperty('display', 'none');
        });
      }
    });

    app.insertScriptBefore(div, this.src);
    this.shown = true;
  }

  // Original method from the original code
  applyOptions(div) {
    logMessage('Banner.applyOptions(). Index: ' + this.index);
    var options = this.options;

    if (typeof options.sticky != 'undefined') {
      //default banner position
      div.style.setProperty('bottom', '0');
      div.style.setProperty('position', 'fixed', 'important');

      if (typeof options.after_id != 'undefined') {
        div.style.setProperty('display', 'none');
        var afterElement = document.getElementById(options.after_id);
        if (typeof afterElement != 'undefined') {
          var bounds = afterElement.getBoundingClientRect();
          var topOffset = afterElement.offsetTop + bounds.height;
          div.style.setProperty('top', topOffset + 'px');
          div.style.removeProperty('bottom');

          window.addEventListener('scroll', function () {
            var y = window.scrollY;
            if (y >= topOffset) {
              div.style.setProperty('display', 'block');
            } else {
              div.style.setProperty('display', 'none');
            }
          });
        }
      }

      if (typeof options.align != 'undefined') {
        switch (options.align) {
          case 'center':
            div.style.setProperty('left', 'calc(50% - ' + (this.size[0] / 2) + 'px)');
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

    //this comes last for possibility to override options
    if (typeof options.css != 'undefined') {
      for (var i in options.css) {
        div.style.setProperty(i, options.css[i]);
      }
    }
  }

  // Original method from the original code
  bannerHtml(markup) {
    logMessage('Banner.bannerHtml(). Index: ' + this.index);
    var div = document.getElementById(this.div_id);

    if (div) {
      div.innerHTML = markup;

      var imageElement = div.querySelector('img');
      if (imageElement) {
        if (imageElement.getAttribute('click-callback') !== null) {
          div.addEventListener('click', function (e) {
            e.preventDefault();
            var clickCallback = imageElement.getAttribute('click-callback');
            if (clickCallback) {
              window[clickCallback](div, e);
            }
          });
        }

        if (imageElement.getAttribute('viewable-callback') !== null) {
          div.addEventListener(app.EVENTS.VIEWABLE, function (e) {
            e.preventDefault();
            var viewableCallback = imageElement.getAttribute('viewable-callback');
            if (viewableCallback) {
              window[viewableCallback](div, e);
            }
          });
        }
      }
    }
  }
}

function logMessage(message) {
  // You can customize this logging function based on your needs
  console.log(message);
}
