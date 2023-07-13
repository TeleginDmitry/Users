import {
	ACTIVE_SORT_CLASS,
	ORDER_BY_PARAM,
	ORDER_PARAM,
	SEARCH_PARAM,
	VISIBLE_CLASS,
} from '../config/index.config.js'
import { getUsers } from '../services/user.service.js'
import { $ } from './selectors.js'

const usersList = $('tbody')
const clearElement = $('.clear')
const sortDateElement = $('.sort_date')
const sortRatingElement = $('.sort_rating')

function converteDate(date) {
	const originalDate = date
	const dateObject = new Date(originalDate)

	const day = dateObject.getDate()
	const month = dateObject.getMonth() + 1
	const year = dateObject.getFullYear() % 100

	const formattedDate = `${day < 10 ? '0' + day : day}.${
		month < 10 ? '0' + month : month
	}.${year}`

	return formattedDate
}

function createUserItem({ username, email, registration_date, rating }) {
	const tr = document.createElement('tr')
	tr.classList.add('table__item')
	tr.innerHTML = `
    <td>${username}</td>
    <td>${email}</td>
    <td>${converteDate(registration_date)}</td>
    <td>${rating}</td>
 `

	usersList.append(tr)

	const img = document.createElement('img')
	img.classList.add('cancel')
	img.src = '../assets/icons/cancel.svg'

	img.addEventListener('click', () => {
		document.body.classList.add('overflow')
		modal.classList.add('active')
	})

	tr.append(img)
}

function changeLink(searchParams) {
	window.history.replaceState(
		{},
		'',
		`${window.location.pathname}?${searchParams}`
	)
}

function deleteAllTr() {
	const itemsList = usersList.querySelectorAll('tr')

	itemsList.forEach(item => {
		item.remove()
	})
}

let isEnableObserver = false

let paramsQuery = { page: 1, limit: 5 }
let users = []

async function get() {
	const response = await getUsers(paramsQuery)
	const data = response.data

	if (!data.length) return (isEnableObserver = false)

	users.push(...data)

	users.forEach(user => {
		createUserItem(user)
	})

	paramsQuery['page'] += 1
}

const observerElement = $('.observer')

const observerCallback = (entries, observer) => {
	entries.forEach(async entry => {
		if (entry.isIntersecting && isEnableObserver) {
			console.log('observer')
			await get(paramsQuery)
		}
	})
}

const observerOptions = {}

const observer = new IntersectionObserver(observerCallback, observerOptions)

observer.observe(observerElement)

const input = $('.input')

let timeout

input.addEventListener('input', event => {
	clearTimeout(timeout)

	timeout = setTimeout(async () => {
		const value = event.target.value

		const searchParams = new URLSearchParams(window.location.search)

		users = []

		paramsQuery['page'] = 1

		isEnableObserver = false

		const itemsList = usersList.querySelectorAll('tr')

		itemsList.forEach(item => {
			item.remove()
		})

		if (!value.length) {
			searchParams.delete(SEARCH_PARAM)

			users.forEach(user => {
				createUserItem(user)
			})

			clearElement.classList.remove(VISIBLE_CLASS)

			delete paramsQuery['search']
		} else {
			searchParams.set(SEARCH_PARAM, value)

			clearElement.classList.add(VISIBLE_CLASS)

			paramsQuery['search'] = value
		}

		changeLink(searchParams)

		await get()

		isEnableObserver = true
	}, 200)
})

const urlParams = new URLSearchParams(window.location.search)

if (urlParams.has(SEARCH_PARAM)) {
	const searchValue = urlParams.get(SEARCH_PARAM)
	paramsQuery[SEARCH_PARAM] = searchValue
	input.value = searchValue

	clearElement.classList.add(VISIBLE_CLASS)
}
if (urlParams.has(ORDER_BY_PARAM)) {
	const orderBy = urlParams.get(ORDER_BY_PARAM)
	paramsQuery[ORDER_BY_PARAM] = orderBy

	if (orderBy === 'registration_date') {
		sortDateElement.classList.add(ACTIVE_SORT_CLASS)
	} else if (orderBy === 'rating') {
		sortRatingElement.classList.add(ACTIVE_SORT_CLASS)
	}

	clearElement.classList.add(VISIBLE_CLASS)
}
if (urlParams.has(ORDER_PARAM)) {
	const order = urlParams.get(ORDER_PARAM)
	paramsQuery[ORDER_PARAM] = order

	clearElement.classList.add(VISIBLE_CLASS)
}

const modal = $('.modal')
const modalButton = $('.modal__button')
const modalButtonNot = $('.button__not')

function closeModal() {
	document.body.classList.remove('overflow')
	modal.classList.remove('active')
}

modal.addEventListener('click', event => {
	if (event.target === modal) {
		closeModal()
	}
})

modalButton.addEventListener('click', () => {})
modalButtonNot.addEventListener('click', () => {
	closeModal()
})

let orderDate = 'asc'
let orderRating = 'asc'

sortDateElement.addEventListener('click', async () => {
	const urlParams = new URLSearchParams(window.location.search)
	urlParams.set(ORDER_BY_PARAM, 'registration_date')

	if (urlParams.get(ORDER_PARAM) === 'asc') {
		orderDate = 'desc'
	} else if (urlParams.get(ORDER_PARAM) === 'desc') {
		orderDate = 'asc'
	}

	users = []

	isEnableObserver = false

	deleteAllTr()

	urlParams.set(ORDER_PARAM, orderDate)

	changeLink(urlParams)

	paramsQuery['page'] = 1
	paramsQuery[ORDER_BY_PARAM] = 'registration_date'
	paramsQuery[ORDER_PARAM] = orderDate

	await get()

	isEnableObserver = true

	sortRatingElement.classList.remove(ACTIVE_SORT_CLASS)
	sortDateElement.classList.add(ACTIVE_SORT_CLASS)
	clearElement.classList.add(VISIBLE_CLASS)

	if (orderDate === 'asc') orderDate = 'desc'
	else orderDate = 'asc'
})

sortRatingElement.addEventListener('click', async () => {
	const urlParams = new URLSearchParams(window.location.search)
	urlParams.set(ORDER_BY_PARAM, 'rating')

	if (urlParams.get(ORDER_PARAM) === 'asc') {
		orderRating = 'desc'
	} else if (urlParams.get(ORDER_PARAM) === 'desc') {
		orderRating = 'asc'
	}

	users = []

	isEnableObserver = false

	deleteAllTr()

	urlParams.set(ORDER_PARAM, orderRating)

	changeLink(urlParams)

	paramsQuery['page'] = 1
	paramsQuery[ORDER_BY_PARAM] = 'rating'
	paramsQuery[ORDER_PARAM] = orderRating

	await get()

	isEnableObserver = true

	sortDateElement.classList.remove(ACTIVE_SORT_CLASS)
	sortRatingElement.classList.add(ACTIVE_SORT_CLASS)
	clearElement.classList.add(VISIBLE_CLASS)

	if (orderRating === 'asc') orderRating = 'desc'
	else orderRating = 'asc'
})

clearElement.addEventListener('click', async () => {
	const urlParams = new URLSearchParams(window.location.search)

	urlParams.delete(ORDER_PARAM)
	urlParams.delete(ORDER_BY_PARAM)
	urlParams.delete(SEARCH_PARAM)

	changeLink(urlParams)

	clearElement.classList.remove(VISIBLE_CLASS)
	sortDateElement.classList.remove(ACTIVE_SORT_CLASS)
	sortRatingElement.classList.remove(ACTIVE_SORT_CLASS)

	input.value = ''
	orderDate = 'asc'
	orderRating = 'asc'

	users = []

	isEnableObserver = false

	deleteAllTr()

	paramsQuery = {
		page: 1,
		limit: 5,
	}

	await get()

	isEnableObserver = true
})

document.addEventListener('DOMContentLoaded', async () => {
	await get()

	console.log('DOMContentLoaded')

	isEnableObserver = true
})
