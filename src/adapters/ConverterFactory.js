const JsonConverter = require('../usecases/JsonConverter');
const YamlConverter = require('../usecases/YamlConverter');
const XmlConverter = require('../usecases/XmlConverter');
const ToonConverter = require('../usecases/ToonConverter');
const TomlConverter = require('../usecases/TomlConverter');

class ConverterFactory {
    constructor() {
        this.converters = {
            'json': new JsonConverter(),
            'yaml': new YamlConverter(),
            'xml': new XmlConverter(),
            'toon': new ToonConverter(),
            'toml': new TomlConverter()
        };
    }

    /**
     * getConverter returns the converter instance for a given format
     * @param {string} format 
     * @returns {FormatConverter}
     */
    getConverter(format) {
        if (!format) throw new Error('Format must be specified.');

        const normalizedFormat = format.toLowerCase().trim();
        const converter = this.converters[normalizedFormat];

        if (!converter) {
            throw new Error(`Unsupported format: ${format}`);
        }
        return converter;
    }
}

module.exports = new ConverterFactory();
