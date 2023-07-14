"use strict";

import { $ } from "./selectors.js";
import { getUsers } from "../services/user.service.js";
import {
  ACTIVE_SORT_CLASS,
  LIMIT,
  ORDER_BY_PARAM,
  ORDER_PARAM,
  SEARCH_PARAM,
  VISIBLE_CLASS,
} from "../config/index.config.js";
import { converteDate } from "../utils/converteDate.js";

const usersList = $("tbody");
const clearElement = $(".clear");
const sortDateElement = $(".sort_date");
const sortRatingElement = $(".sort_rating");
const buttonNext = $(".button__next");
const buttonPrevious = $(".button__previous");
const input = $(".input");
const modal = $(".modal");
const modalButton = $(".modal__button");
const modalButtonNot = $(".button__not");

let hasNextPage;
let users = [];
let paramsQuery = { page: 1, limit: LIMIT };
let deletedIds = [];

function deleteAllTr(arrayId) {
  const itemsList = usersList.querySelectorAll("tr");

  itemsList.forEach((item) => {
    if (Array.isArray(arrayId)) {
      arrayId.forEach((id) => {
        if (id === item.id) item.remove();
      });
    } else {
      item.remove();
    }
  });
}

function createUserItem(users) {
  deleteAllTr();

  if (!users.length) return;

  users.forEach(({ username, email, registration_date, rating, id }) => {
    const tr = document.createElement("tr");
    tr.id = id;
    tr.classList.add("table__item");
    tr.innerHTML = `
			<td>${username}</td>
			<td>${email}</td>
			<td>${converteDate(registration_date)}</td>
			<td>${rating}</td>
		`;

    usersList.append(tr);

    const img = document.createElement("img");
    img.classList.add("cancel");
    img.src = "./assets/icons/cancel.svg";

    img.addEventListener("click", () => {
      document.body.classList.add("overflow");
      modal.classList.add("active");

      deletedIds.push(id);
    });

    tr.append(img);
  });
}

async function getUsersFunc() {
  const response = await getUsers(paramsQuery);
  const data = response.data;

  if (!data.length) return (hasNextPage = false);

  hasNextPage = true;

  users.push(...data);

  paramsQuery["page"] += 1;

  return data;
}

function changeLink(searchParams) {
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${searchParams}`,
  );
}

buttonNext.addEventListener("click", async () => {
  if (!hasNextPage) return;

  buttonNext.disabled = true;

  const page = paramsQuery["page"] - 1;
  const limit = paramsQuery["limit"];

  if (page * limit < users.length) {
    const usersArray = users.slice(page * limit - 1, (page + 1) * limit - 1);

    createUserItem(usersArray);

    paramsQuery["page"] += 1;
  } else {
    const data = await getUsersFunc();

    if (data.length < LIMIT) hasNextPage = false;

    if (data.length) {
      createUserItem(data);
    }
  }

  buttonNext.disabled = false;
});

buttonPrevious.addEventListener("click", () => {
  const page = paramsQuery["page"] - 2;
  const limit = paramsQuery["limit"];

  if (page < 1) return;

  const usersArray = users.slice((page - 1) * limit, page * limit);

  createUserItem(usersArray);

  paramsQuery["page"] -= 1;

  hasNextPage = true;
});

let timeout;

input.addEventListener("input", (event) => {
  clearTimeout(timeout);

  timeout = setTimeout(async () => {
    const value = event.target.value;

    const searchParams = new URLSearchParams(window.location.search);
    users = [];
    paramsQuery["page"] = 1;

    if (!value.length) {
      searchParams.delete(SEARCH_PARAM);

      clearElement.classList.remove(VISIBLE_CLASS);

      delete paramsQuery["search"];

      users = [];
    } else {
      searchParams.set(SEARCH_PARAM, value);

      clearElement.classList.add(VISIBLE_CLASS);

      paramsQuery["search"] = value;
    }

    changeLink(searchParams);

    const data = await getUsersFunc();

    createUserItem(data);
  }, 200);
});

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has(SEARCH_PARAM)) {
  const searchValue = urlParams.get(SEARCH_PARAM);
  paramsQuery[SEARCH_PARAM] = searchValue;
  input.value = searchValue;

  clearElement.classList.add(VISIBLE_CLASS);
}
if (urlParams.has(ORDER_BY_PARAM)) {
  const orderBy = urlParams.get(ORDER_BY_PARAM);
  paramsQuery[ORDER_BY_PARAM] = orderBy;

  if (orderBy === "registration_date") {
    sortDateElement.classList.add(ACTIVE_SORT_CLASS);
  } else if (orderBy === "rating") {
    sortRatingElement.classList.add(ACTIVE_SORT_CLASS);
  }

  clearElement.classList.add(VISIBLE_CLASS);
}
if (urlParams.has(ORDER_PARAM)) {
  const order = urlParams.get(ORDER_PARAM);
  paramsQuery[ORDER_PARAM] = order;

  clearElement.classList.add(VISIBLE_CLASS);
}

function closeModal() {
  document.body.classList.remove("overflow");
  modal.classList.remove("active");
}

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

modalButton.addEventListener("click", () => {
  deleteAllTr(deletedIds);
  closeModal();

  users = users.filter((user) => !deletedIds.includes(user.id));
});

modalButtonNot.addEventListener("click", () => {
  closeModal();
  deletedIds.pop();
});

let orderDate = "asc";
let orderRating = "asc";

sortDateElement.addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(ORDER_BY_PARAM, "registration_date");

  if (urlParams.get(ORDER_PARAM) === "asc") {
    orderDate = "desc";
  } else if (urlParams.get(ORDER_PARAM) === "desc") {
    orderDate = "asc";
  }

  urlParams.set(ORDER_PARAM, orderDate);

  changeLink(urlParams);

  users = [];

  paramsQuery["page"] = 1;
  paramsQuery[ORDER_BY_PARAM] = "registration_date";
  paramsQuery[ORDER_PARAM] = orderDate;

  const data = await getUsersFunc();

  if (data.length < LIMIT) hasNextPage = false;

  createUserItem(data);

  sortRatingElement.classList.remove(ACTIVE_SORT_CLASS);
  sortDateElement.classList.add(ACTIVE_SORT_CLASS);
  clearElement.classList.add(VISIBLE_CLASS);

  if (orderDate === "asc") orderDate = "desc";
  else orderDate = "asc";
});

sortRatingElement.addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(ORDER_BY_PARAM, "rating");

  if (urlParams.get(ORDER_PARAM) === "asc") {
    orderRating = "desc";
  } else if (urlParams.get(ORDER_PARAM) === "desc") {
    orderRating = "asc";
  }

  users = [];

  urlParams.set(ORDER_PARAM, orderRating);

  changeLink(urlParams);

  paramsQuery["page"] = 1;
  paramsQuery[ORDER_BY_PARAM] = "rating";
  paramsQuery[ORDER_PARAM] = orderRating;

  const data = await getUsersFunc();

  if (data.length < LIMIT) hasNextPage = false;

  createUserItem(data);

  sortDateElement.classList.remove(ACTIVE_SORT_CLASS);
  sortRatingElement.classList.add(ACTIVE_SORT_CLASS);
  clearElement.classList.add(VISIBLE_CLASS);

  if (orderRating === "asc") orderRating = "desc";
  else orderRating = "asc";
});

clearElement.addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);

  urlParams.delete(ORDER_PARAM);
  urlParams.delete(ORDER_BY_PARAM);
  urlParams.delete(SEARCH_PARAM);

  changeLink(urlParams);

  clearElement.classList.remove(VISIBLE_CLASS);
  sortDateElement.classList.remove(ACTIVE_SORT_CLASS);
  sortRatingElement.classList.remove(ACTIVE_SORT_CLASS);

  input.value = "";
  orderDate = "asc";
  orderRating = "asc";

  paramsQuery = {
    page: 1,
    limit: LIMIT,
  };

  users = [];

  const data = await getUsersFunc();

  if (data.length < LIMIT) hasNextPage = false;

  createUserItem(data);

  hasNextPage = true;
});

document.addEventListener("DOMContentLoaded", async () => {
  const data = await getUsersFunc();

  if (data.length < LIMIT) hasNextPage = false;

  createUserItem(data);
});
