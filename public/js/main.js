let socket = io.connect();

socket.on("products", (products) => {
    // JAVASCRIPT TEMPLATE
    // document.getElementById("datos").innerHTML = dataTable(products);
    // HBS TEMPLATE
    dataTableHBS(products);
});

socket.on("messages", (data) => {
    render(data);
});

function render(data) {
    const html = data
        .map(
            (d) => `<div>
    <strong style='color:blue'>${d.author}</strong><span style="color:brown">[${d.day}-${d.hour}]</span>:
    <em style="color:green">${d.text}</em></div>`
        )
        .join("");
    document.getElementById("msgContainer").innerHTML = html;
}

const form = document.getElementById("tableForm");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = {
        title: form[0].value,
        price: form[1].value,
        thumbnail: form[2].value,
    };
    await fetch("/api/productos/guardar", {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
    });
    form.reset();
    socket.emit("update", "ok");
});

function dataTable(products) {
    let res = "";
    if (products.length) {
        res += `
        <style>
            .table td, .table th {
                vertical-align : middle;
            }
        </style>
        <div class="table-responsive">
            <table class="table table-dark">
                <tr> <th>Nombre</th> <th>Precio</th> <th>Foto</th> <th>ID</th> </tr>
        `;
        res += products
            .map(
                (p) => `
                <tr>
                    <td>${p.title}</td>
                    <td>$${p.price}</td>
                    <td><img width="50" src="${p.thumbnail}" alt="not found"></td>
                    <td>${p.id}</td>
                </tr>
        `
            )
            .join(" ");
        res += `
            </table>
        </div>`;
    }
    return res;
}

async function dataTableHBS(products) {
    let hbs = await fetch("/template/tabla.hbs");
    let data = await hbs.text();
    var template = Handlebars.compile(data);
    let html = template({ products });
    document.getElementById("datos").innerHTML = html;
}

function addMessage(e) {
    let hour = new Date();
    const msgForm = document.getElementById("msgForm");
    msgForm.addEventListener("submit", (e) => {
        e.preventDefault();
    });
    const msg = {
        author: msgForm[0].value,
        text: msgForm[1].value,
        day: hour.toLocaleDateString(),
        hour: hour.toLocaleTimeString(),
    };
    socket.emit("newMsg", msg);
    return false;
}
