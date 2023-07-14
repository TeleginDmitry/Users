export function converteDate(date) {
  const originalDate = date;
  const dateObject = new Date(originalDate);

  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1;
  const year = dateObject.getFullYear() % 100;

  const formattedDate = `${day < 10 ? "0" + day : day}.${
    month < 10 ? "0" + month : month
  }.${year}`;

  return formattedDate;
}
