const spreadsheetId = "14fCzACCweV_jrnwZEgyBLlUQHP0KMpVzpzxn2mIIRlQ"; // Ganti dengan ID Google Sheets Anda
const range = "DATABASE!A:R"; // Sesuaikan dengan range di Google Sheets
const apiKey = "AIzaSyCzZ_aqxwjE7utdsZRQlsvFAHCknN3bZek"; // Ganti dengan API Key dari Google Cloud

function fetchSantriData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            const tableBody = document.getElementById("dataSantri");
            tableBody.innerHTML = ""; // Bersihkan tabel

            rows.slice(1).forEach(row => {
                let tr = document.createElement("tr");
                row.forEach(cell => {
                    let td = document.createElement("td");
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
}

// Panggil fungsi saat halaman dimuat
window.onload = fetchSantriData;
