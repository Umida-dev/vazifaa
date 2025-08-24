const form = document.querySelector("form") as HTMLFormElement;

type User = {
  id: number;
  name: string;
  age: number;
};
let users: User[] = [];

function reduxUsers(users: User[]) {
  users.forEach((item: User) => {
    const { id, name, age } = item;
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const name = formData.get("name");
  const age = formData.get("age");

  users.push({
    id: Math.random(),
    name: (name ?? "").toString(),
    age: Number(age ?? 0),
  });
});
