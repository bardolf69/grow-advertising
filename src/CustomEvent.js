export class CustomEventPolyfill {
/**
 * Constructs a new CustomEvent with the specified event type and parameters.
 *
 * @param {string} event - The type of the event.
 * @param {object} params - Optional parameters for the event.
 * @param {boolean} params.bubbles - Indicates whether the event will bubble up through the DOM.
 * @param {boolean} params.cancelable - Indicates whether the event is cancelable.
 * @param {*} params.detail - Additional data associated with the event.
 * @return {CustomEvent} The newly constructed CustomEvent.
 */
constructor(event, params) {
  params = params || {
    bubbles: false,
    cancelable: false,
    detail: undefined,
  };
  const customEvent = new CustomEvent(event, params);

  // Add console.log statements for debugging
  console.log('Constructed a new CustomEvent:');
  console.log('Event:', event);
  console.log('Params:', params);
  console.log('CustomEvent:', customEvent);

  return customEvent;
}
}

CustomEventPolyfill.prototype = window.Event.prototype;
window.CustomEvent = CustomEventPolyfill;