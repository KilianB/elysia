import Elysia from '../src'
import { req } from '../test/utils'

const app = new Elysia({
	aot: false,
	name: 'top_level'
})

const second_level = () => {
	const app = new Elysia({
		scoped: true,
		name: 'second_level',
		prefix: '/second',
		aot: false
	})
		.post('/works', () => 'OK')
		.post('/fails', (context) => {
			return 'OK Second' + JSON.stringify(context.body)
		})
	return app
}

const first_level = () => {
	return new Elysia({
		prefix: '/first',
		scoped: true,
		name: 'first_level',
		aot: false
	})
		.post('/works', () => 'OK')
		.post('/fails', (context) => {
			return 'OK1' + context.body
		})
		.use(second_level())
}

app.use(first_level())

const response = await app.handle(
	req('/first/second/fails', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: 'string'
		})
	})
)
console.log(await response.text())
