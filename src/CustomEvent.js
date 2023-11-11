export class CustomEventPolyfill {
    constructor(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined,
      };
      const customEvent = document.createEvent('CustomEvent');
      customEvent.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail
      );
  
      return customEvent;
    }
  }
  
  CustomEventPolyfill.prototype = window.Event.prototype;
