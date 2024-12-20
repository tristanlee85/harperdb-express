/**
 * @param {import('http').ClientRequest} req
 * @returns {void}
 */
export function transformRequest(req) {
	// TODO: Implement request transformation
}

/**
 * @param {Buffer} rawBody
 * @param {import('http').IncomingMessage} res
 * @param {import('http').ClientRequest} req
 * @returns {Buffer | string | undefined}
 */
export function transformResponse(rawBody, res, req) {
	// TODO: Implement response transformation
	return rawBody;
}
