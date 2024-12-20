import zlib from 'node:zlib';

/**
 * Decompress the body based on the Content-Encoding header.
 * @param {Buffer} body - The compressed body.
 * @param {string} encoding - The Content-Encoding (gzip, deflate, br).
 * @returns {Promise<Buffer>} - The decompressed body.
 */
export async function decompress(body: Buffer, encoding: string): Promise<Buffer> {
	switch (encoding) {
		case 'gzip':
			return new Promise((resolve, reject) =>
				zlib.gunzip(body, (err, result) => (err ? reject(err) : resolve(result)))
			);
		case 'deflate':
			return new Promise((resolve, reject) =>
				zlib.inflate(body, (err, result) => (err ? reject(err) : resolve(result)))
			);
		case 'br':
			return new Promise((resolve, reject) =>
				zlib.brotliDecompress(body, (err, result) => (err ? reject(err) : resolve(result)))
			);
		default:
			return body;
	}
}

/**
 * Compress the body based on the Content-Encoding header.
 * @param {Buffer} body - The uncompressed body.
 * @param {string} encoding - The Content-Encoding (gzip, deflate, br).
 * @returns {Promise<Buffer>} - The compressed body.
 */
export async function compress(body: Buffer, encoding: string): Promise<Buffer> {
	switch (encoding) {
		case 'gzip':
			return new Promise((resolve, reject) => zlib.gzip(body, (err, result) => (err ? reject(err) : resolve(result))));
		case 'deflate':
			return new Promise((resolve, reject) =>
				zlib.deflate(body, (err, result) => (err ? reject(err) : resolve(result)))
			);
		case 'br':
			return new Promise((resolve, reject) =>
				zlib.brotliCompress(body, (err, result) => (err ? reject(err) : resolve(result)))
			);
		default:
			return body;
	}
}
