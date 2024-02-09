import { ReadableStream, ReadableStreamController } from 'stream/web'
import type { BodyInit } from 'undici-types'

export class ForkStream implements ReadableWritablePair {
	constructor() {
		let readableController: ReadableStreamController<any>
		let readableController2: ReadableStreamController<any>
		this.readable = new ReadableStream({
			start(controller) {
				readableController = controller
			}
		})

		this.readableDuplicate = new ReadableStream({
			start(controller) {
				readableController2 = controller
			}
		})

		this.writable = new WritableStream({
			write(chunk) {
				readableController.enqueue(chunk)
				readableController2.enqueue(chunk)
			}
		})
	}
	readable: globalThis.ReadableStream<any>
	readableDuplicate: globalThis.ReadableStream<any>
	writable: WritableStream<any>
}

export interface RequestOverwrite {
	body?: BodyInit
	url?: string
}

export const cloneAndModifyRequest = (
	request: Request,
	{ body, url }: RequestOverwrite = {}
): Request => {
	if (url) {
		return new Request(url, {
			// ...request,
			body: body !== undefined ? body : request.body,
			credentials: request.credentials,
			headers: request.headers,
			method: request.method,
			mode: request.mode,
			referrerPolicy: (request.referrerPolicy || undefined) as any,
			duplex: request.duplex,
			integrity: request.integrity,
			keepalive: request.keepalive
		})
	} else {
		return new Request({
			url: request.url,
			body: body !== undefined ? body : request.body,
			credentials: request.credentials,
			headers: request.headers,
			method: request.method,
			mode: request.mode,
			referrerPolicy: (request.referrerPolicy || undefined) as any,
			duplex: request.duplex,
			integrity: request.integrity,
			keepalive: request.keepalive
		})
	}
}
