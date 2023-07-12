import { getUsers } from "../services/user.service.js";

const usersList = document.querySelector(".table__list");

function createUserItem(data) {
  const li = document.createElement("li");
  li.innerHTML = `<li class="table__item">
    <p class="field username">${data.username}</p>
    <p class="field">${data.email}</p>
    <p class="field">${data.registration_date}</p>
    <p class="field">${data.rating}</p>
  </li>`;

  usersList.append(li);
}

async function get() {
  const response = await getUsers();

  const data = response.data;

  data.forEach((item) => {
    createUserItem(item);
  });
}

get();
