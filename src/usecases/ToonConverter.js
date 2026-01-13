const FormatConverter = require('../domain/FormatConverter');
const yaml = require('js-yaml');

class ToonConverter extends FormatConverter {
    async _getModule() {
        // Dynamic import to support ESM-only package in CommonJS env (Insomnia)
        return await import('@toon-format/toon');
    }

    async parse(text) {
        if (!text) return {};
        try {
            const toon = await this._getModule();
            return toon.decode(text);
        } catch (err) {
            // Failed standard TOON, try properties parser (Key=Value)
            try {
                return this._parseCustom(text);
            } catch (customErr) {
                // Failed properties parser. 
                // Try Heuristic YAML (Sanitize type/count annotations: "key: type[N]:" -> "key:")
                try {
                    return this._parseHeuristicYaml(text);
                } catch (yamlErr) {
                    // If all fail, throw combined error
                    throw new Error(`Invalid TOON (Standard: ${err.message}) (Custom: ${customErr.message}) (Heuristic: ${yamlErr.message})`);
                }
            }
        }
    }

    _parseHeuristicYaml(text) {
        // 1. Stripe type annotations: "key: type[N]:" -> "key:"
        let sanitized = text.replace(/:\s*\w+(\[\d+\])?\s*:/g, ':');

        // 2. Fix space-separated flow sequences: "[a b c]" -> "[a, b, c]"
        // Find [...] blocks
        sanitized = sanitized.replace(/\[(.*?)\]/g, (match, content) => {
            // If invalid YAML sequence (no commas, has spaces)
            if (!content.includes(',') && content.trim().includes(' ')) {
                // Replace spaces with ", " (naively)
                return '[' + content.trim().split(/\s+/).join(', ') + ']';
            }
            return match;
        });

        return yaml.load(sanitized);
    }

    _parseCustom(text) {
        text = text.trim();
        let content = text;

        // Check for curly braces, remove if present
        if (text.startsWith('{') && text.endsWith('}')) {
            content = text.slice(1, -1).trim();
        }

        const result = {};

        // Split by lines
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue; // Skip empty lines

            // Split by first '='
            const separatorIndex = trimmedLine.indexOf('=');
            if (separatorIndex === -1) {
                // If line has no '=', maybe it's just a value or comment? 
                // For now, adhere to key=value requirement.
                throw new Error(`Missing '=' in line: ${trimmedLine}`);
            }

            const key = trimmedLine.substring(0, separatorIndex).trim();
            const value = trimmedLine.substring(separatorIndex + 1).trim();

            result[key] = value;
        }
        return result;
    }

    async stringify(obj) {
        try {
            const toon = await this._getModule();
            return toon.encode(obj);
        } catch (err) {
            throw new Error(`Failed to stringify TOON: ${err.message}`);
        }
    }

    getMimeType() {
        return 'application/toon';
    }
}

module.exports = ToonConverter;
