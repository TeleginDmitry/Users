import instance from '../api/api.interceptor.js'

export async function getUsers(params) {
	try {
		return await instance.get('users', {
			params,
		})
	} catch {
		throw new Error('Что то пошло не так!')
	}
}
