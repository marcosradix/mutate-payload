const FormatConverter = require('../domain/FormatConverter');

class JsonConverter extends FormatConverter {
    async parse(text) {
        if (!text) return {};
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error(`Invalid JSON: ${err.message}`);
        }
    }

    async stringify(obj) {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (err) {
            throw new Error(`Failed to stringify JSON: ${err.message}`);
        }
    }

    getMimeType() {
        return 'application/json';
    }
}

module.exports = JsonConverter;
