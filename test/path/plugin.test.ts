import { describe, expect, it } from 'bun:test'
import { Elysia } from '../../src'

describe.only('plugin', () => {
	it('scoped plugin routes are visible in app.routes', () => {
		const plugin = new Elysia({ prefix: '/v1', scoped: true })
			.get('', () => '')
			.put('/new', () => '')

		const app = new Elysia().use(plugin)

		expect(app.routes.some((r) => r.path === '/v1/new')).toBeTrue()
	})

	it('plugin routes are visible in app.routes', () => {
		const plugin = new Elysia({ prefix: '/v1', scoped: false })
			.get('', () => '')
			.put('/new', () => '')

		const app = new Elysia().use(plugin)

		expect(app.routes.some((r) => r.path === '/v1/new')).toBeTrue()
	})
})
