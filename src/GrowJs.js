export default function GrowJs() {
    if (typeof window.CustomEvent === "function") return false;
  
    class CustomEventPolyfill extends window.Event {
        constructor(event, params) {
            params = params || {
                bubbles: false,
                cancelable: false,
                detail: undefined,
            };
            
            const customEvent = new CustomEvent(event, {
                bubbles: params.bubbles,
                cancelable: params.cancelable,
                detail: params.detail,
            });
        
            return customEvent;
        }
    }
  
    CustomEventPolyfill.prototype = window.Event.prototype;
    window.CustomEvent = CustomEventPolyfill;

    const GrowJs = {
        var document = _w.document;
        var growAdsContainers = [];

        var Banner = function (div, zone_id, index, size, src, options) {
            this.zone_id = zone_id;
            this.index = index;
            this.size = size;
            this.options = options || {};
            this.shown = false;
            this.src = null;
            this.div = div;
            this.div_id = 'growjs-placement_' + this.zone_id;

            this.init();
        };

    Banner.prototype.init = function () {
        logMessage(`Banner.init(). Index: ${this.index}`);
        this.src = `https://financialnews.growadvertising.com/a?zoneId=${this.zone_id}&i=${this.index}`;

        const params = Object.entries(this.options).flatMap(([key, value]) => {
            if (Array.isArray(value)) {
                return value.map((arrayValue) => `${key}[]=${arrayValue}`);
            } else {
                return `${key}=${value}`;
            }
        });

        this.src = `${this.src}&${params.join('&')}`;
    };

    var app = {
        divClass: 'growjs-placement',
        initialized: false,
        logging: true,
        ads: [],
        banners: {},
        viewability: {},
        TRIGGERS: {
            TIMER: 'timer',
            CLICK: 'click',
            SCROLL: 'scroll'
        },
        EVENTS: {
            INIT: 'GrowJsOnInit',
            LOAD: 'GrowJsOnLoad'
        },
        defaults: {
            interstitialDelay: 30000,
            trigger: 'timer'
        }
    };

    const logMessage = (message) => {
        if (app.logging && _w.console && _w.console.log) {
            _w.console.log(message);
        }
    };

    app.init = function () {
        if (this.initialized) {
            return;
        }

        app.dispatchEvent(document, app.EVENTS.INIT, {});
        logMessage('GrowJs.init()');
        this.initialized = true;
        this.ads = this.ads || [];

        app.viewability = new Viewability();
        logMessage('Viewability init()');
        app.viewability.initializeViewability();

        this.ads.push = this.register;
        this.ads.forEach(app.register);
    };

    app.generateUniqueIndex = function () {
        var index;
        do {
            index = Math.random().toString(36).substring(2);
        } while (typeof this.banners[index] !== 'undefined');

        return index;
    };

    app.getValueOrDefault = function (value, name) {
        return typeof value === 'undefined' ? app.defaults[name] : value;
    };

    app.register = function (o) {
        if (typeof o.handler === 'function') {
            return o.handler(o.node);
        }

        return null;
    };

    app.insertScriptBefore = function (beforeElement, src) {
        const s = document.createElement('script');
        s.async = true;
        s.type = 'text/javascript';
        s.src = src;

        beforeElement.parentElement.insertBefore(s, beforeElement);
    };

    app.addBanner = function (banner) {
        logMessage('GrowJs.addBanner(): ' + banner.zone_id);

        this.banners[banner.index] = banner;

        banner.div_id += '_' + banner.index;
        banner.div.setAttribute('id', banner.div_id);
        banner.div.setAttribute('data-index', banner.index);
        banner.div.setAttribute('data-zone-id', banner.zone_id);

        return banner;
    };

    app.createBanner = function (parent, zone_id, size, script_url, options) {
        var div = parent.querySelector('.' + this.divClass);
        if (div && div.hasAttribute('data-index')) {
            return this.banners[div.getAttribute('data-index')];
        }
        console.log('GrowJs.createBanner()');
        var banner = new Banner(div, zone_id, this.generateUniqueIndex(), size, script_url, options);

        return this.addBanner(banner);
    };

    app.showBanner = function (index) {
        logMessage('GrowJs.showBanner()');

        var banner = this.banners[index];

        if (typeof (banner) === 'undefined') {
            logMessage('Banner not found');

            return;
        }

        if (banner.shown) {
            logMessage('Banner already shown');

            return;
        }

        var div = document.getElementById(banner.div_id);

        if (!div) {
            return;
        }

        div.addEventListener(app.EVENTS.LOAD, function (e) {
            app.viewability.addViewableEntity(this.id);
            var imageElement = e.detail.data.imageElement;

            if (imageElement) {
                app.applyOptions(div, banner);
                if (imageElement.getAttribute('viewable-callback') !== null) {
                    div.setAttribute('viewable-callback', imageElement.getAttribute('viewable-callback'));
                }

                if (imageElement.getAttribute('tracking-callback') !== null) {
                    div.setAttribute('tracking-callback', imageElement.getAttribute('tracking-callback'));
                }
                document.querySelector('#' + banner.div_id + ' .gjs_close_b').addEventListener('click', function (e) {
                    div.style.setProperty('display', 'none');
                });
            }
        });

        this.insertScriptBefore(div, banner.src);
        banner.shown = true;
    };

    app.applyOptions = function (div, banner) {
        const options = banner.options;

        if (options.sticky !== undefined) {
            //default banner position
            div.style.setProperty('bottom', '0');
            div.style.setProperty('position', 'fixed', 'important');

            if (options.after_id !== undefined) {
                div.style.setProperty('display', 'none');
                const afterElement = document.getElementById(options.after_id);
                if (afterElement !== undefined) {
                    const bounds = afterElement.getBoundingClientRect();
                    const topOffset = afterElement.offsetTop + bounds.height;
                    div.style.setProperty('top', topOffset + 'px');
                    div.style.removeProperty('bottom');

                    _w.addEventListener('scroll', function () {
                    const y = _w.scrollY;
                    if (y >= topOffset) {
                        div.style.setProperty('display', 'block');
                    } else {
                        div.style.setProperty('display', 'none');
                    }
                    });
                }
            }

            if (options.align !== undefined) {
                switch (options.align) {
                    case 'center':
                    div.style.setProperty('left', `calc(50% - ${banner.size[0] / 2}px)`);
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
        if (options.css !== undefined) {
            for (const i in options.css) {
                div.style.setProperty(i, options.css[i]);
            }
        }
    };

    app.bannerHtml = function (index, markup) {
        logMessage('GrowJs.bannerHtml()');
        var banner = this.banners[index];

        if (typeof (banner) === 'undefined') {
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
                    imageElement.addEventListener('load', function () {
                        app.dispatchEvent(div, app.EVENTS.LOAD, {
                            banner: banner,
                            imageElement: imageElement
                        });
                    });
                }
            }
        }
    };

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
            // logMessage(options);

            if (typeof options.sticky != 'undefined') {
                //default banner position
                // div.style.setProperty('bottom', '0');
                div.style.setProperty('position', 'fixed', 'important');

                var topSpace = 0,
                    bottomSpace = 0,
                    rightSpace = 0,
                    leftSpace = 0;

                if (typeof options.spacing !== 'undefined') {
                    var spacingProperty = options.spacing;

                    if (typeof spacingProperty.top !== 'undefined') {
                        topSpace = spacingProperty.top;
                    }

                    if (typeof spacingProperty.bottom !== 'undefined') {
                        bottomSpace = spacingProperty.bottom;
                    }

                    if (typeof spacingProperty.right !== 'undefined') {
                        rightSpace = spacingProperty.right;
                    }

                    if (typeof spacingProperty.left !== 'undefined') {
                        leftSpace = spacingProperty.left;
                    }
                }

                if (typeof options.sticky["vertical-align"] !== 'undefined') {
                    switch(options.sticky["vertical-align"]) {
                        case "top":
                            div.style.setProperty('top', topSpace + 'px');
                        break;
                        case "bottom":
                            div.style.setProperty('bottom', bottomSpace + 'px');
                        break;
                    }
                }

                if (typeof options.sticky.selector !== 'undefined' && options.sticky.trigger !== 'undefined' &&
                options.sticky.trigger === app.TRIGGERS.SCROLL) {

                    div.style.setProperty('display', 'none');
                    var afterElement = document.querySelector(options.sticky.selector);

                    if (afterElement) {
                        var bounds = afterElement.getBoundingClientRect();
                        var topOffset = afterElement.offsetTop + bounds.height;

                        // div.style.setProperty('top', topOffset);
                        // div.style.removeProperty('bottom');

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

                if (typeof options.sticky.align != 'undefined') {
                    switch (options.sticky.align) {
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

            //fix to make iframe height fit with content
            if (isNaN(parseInt(height))) {
                iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
            }
            iframe.style.visibility = 'visible';
            app.dispatchEvent(div, app.EVENTS.LOAD, {
                iframe: iframe
            });
        });
    };

    app.popunder = function (index, url) {
        logMessage('GrowJs.popunder()');
        var banner = this.banners[index];

        if (typeof (banner) === 'undefined') {
            logMessage('Banner not found. id: ' + index);

            return;
        }

        document.addEventListener('click', function(e) {
            document.removeEventListener('click', arguments.callee, false);
            window.open(url, 'window');
            _w.focus();
        });
    };

    app.pushNotification = function (index, data) {

    };

    app.createIframe = function (index, src, markup, width, height, options) {
        logMessage('GrowJs.createIframe()');

        if (!this.banners[index]) {
            logMessage('Banner not found. id: ' + index);
            return;
        }

        var banner = this.banners[index];

        if (!banner) {
            logMessage('Banner not found. id: ' + index);
            return;
        }

        var div = document.getElementById(banner.div_id);
        if (!div) {
            logMessage('Div with id: ' + banner.div_id + ' not found');
            return;
        }

        div.innerHTML = '';

        var iframe = document.createElement('iframe');
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
            for (var i in options) {
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
                var content = iframe.contentDocument;
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

    app.removeIframe = function(index) {
        var iframe = document.getElementById('growjs_placement_' + index + '_iframe');
        if (iframe) {
            iframe.remove();
        }
    };

    app.iframeHtmlInterstitial = function (index, src, markup, width, height, options) {
        logMessage('GrowJs.iframeHtmlInterstitial()');

        var iframeObject = this.createIframe(index, src, markup, width, height, options);
        var div = iframeObject.div;
        var iframe = iframeObject.iframe;

        div.style.display = 'none';

        var trigger = app.getValueOrDefault(options.trigger, 'interstitialTrigger');

        iframe.addEventListener('load', function (loadEvent) {
            var applyIframeStyles = function (iframe) {
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
            }

            if (trigger === app.TRIGGERS.TIMER) {
                setTimeout(function () {
                    applyIframeStyles(iframe);
                    div.style.display = 'block';

                    app.viewability.addViewableEntity(iframe.id, {'percentageToBeViewable': 1});
                }, app.getValueOrDefault(options.delay, 'interstitialDelay'));
            } else if (trigger === app.TRIGGERS.CLICK) {
                var elementsClass = options['trigger-class'];
                if (typeof elementsClass != 'undefined') {
                    _w.document.querySelector(elementsClass).addEventListener('click', function (e) {
                        applyIframeStyles(iframe);
                        div.style.display = 'block';

                        app.viewability.addViewableEntity(iframe.id, {'percentageToBeViewable': 1});
                        this.removeEventListener('click', arguments.callee, false);
                    });
                }
            }

        });
    };

    app.iframeHtmlExit = function (index, src, markup, width, height, options) {
        logMessage('GrowJs.iframeHtmlExit()');

        var iframeObject = this.createIframe(index, src, markup, width, height, options);
        var div = iframeObject.div;
        var iframe = iframeObject.iframe;

        div.style.display = 'none';

        function handleMouseLeave(e) {
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
            _w.document.addEventListener('mouseleave', handleMouseLeave);
        });
    };

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
            //fix to make iframe height fit with content
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

        div.innerHTML = markup;

        var arr = div.getElementsByTagName('script');
        for (var n = 0; n < arr.length; n++) {
            nodeScriptReplace(arr[n]);
        }

        function nodeScriptReplace(node) {
            if (nodeScriptIs(node)) {
                node.parentNode.replaceChild(nodeScriptClone(node), node);
            } else {
                var i = -1, children = node.childNodes;
                while (++i < children.length) {
                    nodeScriptReplace(children[i]);
                }
            }
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
    }

    app.dispatchEvent = function (target, type, data) {
        logMessage(`GrowJs.dispatchEvent(): ${type}`);
        var detail = { data };

        target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
    };

    if (_w.GrowJs) {
        app.ads = _w.GrowJs.ads;
    }

    _w.GrowJs = app;
    app.init();

    function Viewability() {
        var viewables = [];
        var screenWidth;
        var screenHeight;
        var screenY;
        var screenX;

        var timeBeforeViewable = 300;
        var percentageToBeViewable = .5;
        var percentageToBeViewableHigh = .3;
        var bigHeight = 500;
        var timeInterval = 100;
        var inFocus = true;

        function ViewableAd() {
            this.width = 0;
            this.height = 0;
            this.position = {
                top: 0,
                left: 0
            };
            this.percentOnScreen = 0.0;
            this.durationOnScreen = 0.0;
            this.DOMElement = {};
            this.timer = null;
            this.customParams = {};

            return this;
        }

        ViewableAd.prototype.recalculate = function () {
            screenHeight = window.innerHeight;
            screenWidth = window.innerWidth;
            screenX = window.scrollX;
            screenY = window.scrollY;
            var bounds = this.DOMElement.getBoundingClientRect();
            this.position.left = bounds.left + screenX;
            this.position.top = bounds.top + screenY;
            this.width = bounds.width;
            this.height = bounds.height;

            var screenRect = {
                x1: screenX,
                y1: screenY + screenHeight,
                x2: screenX + screenWidth,
                y2: screenY
            };
            var itemRect = {
                x1: this.position.left,
                y1: this.position.top + this.height,
                x2: this.position.left + this.width,
                y2: this.position.top
            };

            var itemArea = (itemRect.x2 - itemRect.x1) * (itemRect.y1 - itemRect.y2);

            var x_overlap = Math.max(0, Math.min(screenRect.x2, itemRect.x2) - Math.max(screenRect.x1, itemRect.x1));
            var y_overlap = Math.max(0, Math.min(screenRect.y1, itemRect.y1) - Math.max(screenRect.y2, itemRect.y2));

            var overlapArea = x_overlap * y_overlap;
            this.percentOnScreen = overlapArea / itemArea;
        };

        ViewableAd.prototype.initialize = function (domItem) {
            this.DOMElement = domItem;
            this.DOMElement.setAttribute('viewable', 'false');
            var self = this;
            var viewablePercentage = this.customParams['percentageToBeViewable'] || percentageToBeViewable;
            var viewablePercentageHigh = this.customParams['percentageToBeViewableHigh'] || percentageToBeViewableHigh;
            var viewableTime = this.customParams['timeBeforeViewable'] || timeBeforeViewable;
            var bigHeightLocal = this.customParams['bigHeight'] || bigHeight;
            this.timer = setInterval(function () {
                self.recalculate();
                if (self.percentOnScreen >= viewablePercentage ||
                    (self.width >= bigHeightLocal && self.percentOnScreen >= viewablePercentageHigh)) {
                    self.durationOnScreen += timeInterval;

                    if (self.durationOnScreen > viewableTime) {
                        clearInterval(this.timer);
                        markViewable(self);
                    }
                } else {
                    self.durationOnScreen = 0;
                }
            }, timeInterval);
        };

        Viewability.prototype.addViewableEntity = function (elementId, customParams) {
            var viewable = new ViewableAd();
            viewable.initialize(document.getElementById(elementId), customParams);
            viewables.forEach(function (item) {
                if (item.DOMElement.id == elementId) {
                    clearInterval(item.timer);
                    viewables.splice(viewables.indexOf(item), 1);
                }
            });
            viewables.push(viewable);
            viewable.recalculate();
            markEligible(viewable);
        };

        Viewability.prototype.initializeViewability = function () {
            document.createAttribute("viewable");
        };

        Viewability.prototype.logViewables = function () {
            console.log(viewables);
        };

        function markViewable(viewable) {
            viewable.DOMElement.setAttribute('viewable', 'true');

            clearInterval(viewable.timer);
            var i = viewables.indexOf(viewable);
            viewables.splice(i, 1);
            var callbackUrl = viewable.DOMElement.getAttribute('viewable-callback');
            var trackingUrl = viewable.DOMElement.hasAttribute('tracking-callback')
                ? viewable.DOMElement.getAttribute('tracking-callback')
                : null;

            if (callbackUrl != null) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // sent
                    }
                };
                xhttp.open("GET", callbackUrl, true);
                xhttp.send();
            }

            if (trackingUrl !== null) {
                try {
                    var image = new Image(0, 0);
                    image.src = trackingUrl;
                    image.style.display = 'none';
                    viewable.DOMElement.after(image);
                } catch (error) {
                    console.log('Can not load ' + trackingUrl);
                }
            }
        }

        function markEligible(viewable) {
            var callbackUrl = viewable.DOMElement.getAttribute('eligible-callback');
            if (callbackUrl != null) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // sent
                    }
                };
                xhttp.open("GET", callbackUrl, true);
                xhttp.send();
            }
        }

        _w.addEventListener('focus', function () {
            inFocus = true;
        });

        _w.addEventListener('blur', function () {
            inFocus = false;
        });
    }

    _w.addEventListener("resize", function(){
        growAdsContainers.forEach(function (e) {
            e.style.height = e.contentWindow.document.body.scrollHeight + 'px';
        });
    });
    
    return GrowJs;
}