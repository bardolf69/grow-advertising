import { Banner } from './banner.js';

var app = {
  EVENTS: {
    LOAD: 'gjsLoad',
    VIEWABLE: 'gjsViewable',
  },

  // Other properties and methods from the original code...

  createBanner: function (zone_id, index, size, src, options) {
    var div = document.createElement('div');
    div.id = 'growjs-placement_' + zone_id;
    document.body.appendChild(div);

    var banner = new Banner(div, zone_id, index, size, src, options);

    // Additional method to show banner
    banner.show = function () {
      banner.showBanner();
    };

    // Additional method to update banner options
    banner.updateOptions = function (newOptions) {
      banner.updateOptions(newOptions);
    };

    // Additional method to toggle banner visibility
    banner.toggleVisibility = function () {
      banner.toggleVisibility();
    };

    // Additional property to get the banner URL
    Object.defineProperty(banner, 'url', {
      get: function () {
        return banner.bannerUrl;
      },
      enumerable: true,
    });

    return banner;
  },
};

// Other code from the original file...

// Example usage:
var zone_id = 'your_zone_id';
var index = 1;
var size = [300, 250];
var src = 'https://youradprovider.com/youradtag';
var options = {
  align: 'center',
  css: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
  },
};

var banner = app.createBanner(zone_id, index, size, src, options);
banner.show();