export class Banner {
    /**
     * Initializes a new instance of the constructor.
     *
     * @param {object} div - the div element
     * @param {string} zone_id - the zone id
     * @param {number} index - the index
     * @param {number} size - the size
     * @param {string} src - the source
     * @param {object} options - the options (optional)
     */
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

/**
 * Initializes the function by setting up the base URL and parameters.
 *
 * @return {undefined} This function does not return a value.
 */
init() {
    const baseUrl = "https://financialnews.growadvertising.com/a";
    const params = [];

    console.log("Initializing...");

    this.src = `${baseUrl}?zoneId=${this.zone_id}&i=${this.index}`;

    Object.entries(this.options).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(option => {
                params.push(`${key}[]=${option}`);
            });
        } else {
            params.push(`${key}=${value}`);
        }
    });

    this.src = `${this.src}&${params.join('&')}`;

    console.log("Initialization complete.");
}
}