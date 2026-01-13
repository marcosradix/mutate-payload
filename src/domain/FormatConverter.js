/**
 * Abstract class representing a format converter.
 * All concrete converters must extend this class and implement the methods.
 */
class FormatConverter {
    constructor() {
        if (this.constructor === FormatConverter) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    /**
     * Parses the text content into a JavaScript object.
     * @param {string} text - The raw text content.
     * @returns {Promise<Object>} The parsed JavaScript object.
     */
    async parse(text) {
        throw new Error("Method 'parse()' must be implemented.");
    }

    /**
     * Converts a JavaScript object into a string string in this format.
     * @param {Object} obj - The JavaScript object.
     * @returns {Promise<string>} The string representation.
     */
    async stringify(obj) {
        throw new Error("Method 'stringify()' must be implemented.");
    }

    /**
     * Returns the MIME type generally associated with this format.
     * @returns {string}
     */
    getMimeType() {
        return 'text/plain';
    }
}

module.exports = FormatConverter;
