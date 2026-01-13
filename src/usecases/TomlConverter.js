const FormatConverter = require('../domain/FormatConverter');
const toml = require('@iarna/toml');

class TomlConverter extends FormatConverter {
    async parse(text) {
        if (!text) return {};
        try {
            return toml.parse(text);
        } catch (err) {
            throw new Error(`Invalid TOML: ${err.message}`);
        }
    }

    async stringify(obj) {
        try {
            return toml.stringify(obj);
        } catch (err) {
            throw new Error(`Failed to stringify TOML: ${err.message}`);
        }
    }

    getMimeType() {
        return 'application/toml';
    }
}

module.exports = TomlConverter;
