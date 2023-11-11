function Viewability() {
    var viewables = [];
    var screenWidth;
    var screenHeight;
    var screenY;
    var screenX;
  
    var timeBeforeViewable = 300;
    var percentageToBeViewable = 0.5;
    var percentageToBeViewableHigh = 0.3;
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
  
    Viewability.prototype.pause = function () {
        inFocus = false;
    };
  
    Viewability.prototype.resume = function () {
        inFocus = true;
    };
  
    return new Viewability();
}
  
  var viewability = new Viewability();
  viewability.initializeViewability();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      viewability.resume();
    } else {
      viewability.pause();
    }
});
  