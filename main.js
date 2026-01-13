const converterFactory = require('./src/adapters/ConverterFactory');

module.exports.requestHooks = [
    async (context) => {
        const request = context.request;

        // Check Headers first
        let sourceFormat = request.getHeader('X-Convert-Source');
        let targetFormat = request.getHeader('X-Convert-Target');

        // If not in headers, check Environment Variables
        if (!sourceFormat) {
            sourceFormat = request.getEnvironmentVariable('CONVERT_SOURCE');
        }
        if (!targetFormat) {
            targetFormat = request.getEnvironmentVariable('CONVERT_TARGET');
        }

        // Source is required to know what to parse
        if (!sourceFormat) {
            return;
        }

        // Default Target to JSON if not found
        if (!targetFormat) {
            targetFormat = 'json';
        }

        try {
            const body = request.getBody();
            if (!body.text) return; // Nothing to convert

            // Get Converters
            const sourceConverter = converterFactory.getConverter(sourceFormat);
            const targetConverter = converterFactory.getConverter(targetFormat);

            // 1. Parse
            const intermediateObj = await sourceConverter.parse(body.text);

            // 2. Stringify
            const newBodyText = await targetConverter.stringify(intermediateObj);

            // 3. Update Request
            request.setBody({
                text: newBodyText,
            });

            // Update Content-Type Header
            request.setHeader('Content-Type', targetConverter.getMimeType());

        } catch (err) {
            await context.app.alert('Payload Conversion Error', err.message);
            // Stop execution/throw to prevent sending bad request
            throw err;
        }
    }
];
