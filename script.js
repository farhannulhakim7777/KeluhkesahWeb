const scriptURL = "https://script.google.com/macros/s/AKfycbxswGTSPvHeI6hWAfVCZWKEwj9l_5-n3AHgd_zvsdFtB3IYNDF30A6NXGO-uE_W52N4Kw/exec"; // ganti dengan URL kamu

// Kirim data ke Google Sheets
document.getElementById("formKeluhan").addEventListener("submit", function (e) {
    e.preventDefault();

    const isiKeluhan = document.getElementById("keluhanInput").value.trim();
    if (isiKeluhan === "") return;

    const tanggal = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify({ keluhan: isiKeluhan, tanggal: tanggal }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(() => {
        document.getElementById("keluhanInput").value = "";
        ambilData(); // Refresh daftar keluhan
    });
});

// Ambil data dari Google Sheets
function ambilData() {
    fetch(scriptURL)
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById("keluhanList");
            container.innerHTML = "";
            data.reverse().forEach((item) => {
                const div = document.createElement("div");
                div.className = "keluhan-item";
                div.innerHTML = `
          <div>${item.teks}</div>
          <div class="tanggal">${item.waktu}</div>
        `;
                container.appendChild(div);
            });
        });
}

// Tampilkan saat pertama kali buka
ambilData();
