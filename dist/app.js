const form = document.querySelector("form");
let users = [];
function reduxUsers(users) {
    users.forEach((item) => {
        const { id, name, age } = item;
    });
}
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name");
    const age = formData.get("age");
    URLSearchParams.push({
        id: Math.random(),
        name: (name ?? "").toString(),
        age: (age ?? "").toString(),
    });
});
export {};
//# sourceMappingURL=app.js.map