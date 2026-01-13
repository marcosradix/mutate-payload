const FormatConverter = require('../domain/FormatConverter');
const xml = require('xml-js');

class XmlConverter extends FormatConverter {
    async parse(text) {
        if (!text) return {};
        try {
            const result = xml.xml2js(text, { compact: true, ignoreComment: true, nativeType: true });
            return this._cleanup(result);
        } catch (err) {
            throw new Error(`Invalid XML: ${err.message}`);
        }
    }

    _cleanup(obj) {
        // 1. Remove _declaration if present
        if (obj._declaration) {
            delete obj._declaration;
        }

        // 2. Unwrap 'root' if it's the only key (common XML convention)
        const keys = Object.keys(obj);
        if (keys.length === 1 && keys[0] === 'root') {
            obj = obj.root;
        }

        // 3. recursively simplify: remove _text and flatten
        return this._simplify(obj);
    }

    _simplify(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        // Check if object is wrapping a text value: { "_text": "value" }
        // Note: xml-js might return { "_text": "123" } or { "_text": 123 } if nativeType=true
        if (obj._text !== undefined && Object.keys(obj).length === 1) {
            return obj._text;
        }

        // Iterate over keys
        for (const key in obj) {
            // Recurse
            obj[key] = this._simplify(obj[key]);

            // Handle attributes if desired? User didn't ask, but xml-js puts them in _attributes.
            // For now, let's just focus on _text. 
            // If the user wants to keep attributes, we leave them.
            // But usually JSON payloads from XML want clean key-values.
        }
        return obj;
    }

    async stringify(obj) {
        try {
            // Check if obj has a single root key (standard XML)
            const keys = Object.keys(obj);
            let objToConvert = obj;

            // If multiple top-level keys, wrap in <root>
            if (keys.length !== 1) {
                objToConvert = { root: obj };
            }

            // Should we add declaration? _declaration: { _attributes: { version: "1.0", encoding: "UTF-8" } }
            // Let's stick to simple root wrapping first. 
            // Most APIs are fine without declaration if Content-Type is set.

            return xml.js2xml(objToConvert, { compact: true, spaces: 2 });
        } catch (err) {
            throw new Error(`Failed to stringify XML: ${err.message}`);
        }
    }

    getMimeType() {
        return 'application/xml';
    }
}

module.exports = XmlConverter;
