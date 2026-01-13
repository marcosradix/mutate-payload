const FormatConverter = require('../domain/FormatConverter');
const yaml = require('js-yaml');

class YamlConverter extends FormatConverter {
    async parse(text) {
        if (!text) return {};
        try {
            return yaml.load(text);
        } catch (err) {
            throw new Error(`Invalid YAML: ${err.message}`);
        }
    }

    async stringify(obj) {
        try {
            return yaml.dump(obj);
        } catch (err) {
            throw new Error(`Failed to stringify YAML: ${err.message}`);
        }
    }

    getMimeType() {
        return 'application/yaml';
    }
}

module.exports = YamlConverter;
