// Pastikan scriptURL ini SAMA PERSIS dengan Web App URL dari Apps Script-mu
const scriptURL = "https://script.google.com/macros/s/AKfycbxQbpnc9CR7InjomMNBWFhwuGClB9dqOK8PO-WrYFmPvj4nJ9yiHqRVb5N7H8ZOdtCN/exec"; // <-- Pastikan URL ini benar

document.getElementById("formKeluhan").addEventListener("submit", function (e) {
    e.preventDefault();

    const isiKeluhan = document.getElementById("keluhanInput").value.trim();
    if (!isiKeluhan) {
        alert("Mohon isi keluhan Anda.");
        return;
    }

    const tanggal = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const formData = new FormData();
    formData.append("keluhan", isiKeluhan);
    formData.append("tanggal", tanggal);
    formData.append("action", "add"); // Menambahkan action untuk membedakan di backend

    console.log("Mengirim keluhan baru:", { isiKeluhan, tanggal });

    fetch(scriptURL, {
            method: "POST",
            body: formData,
        })
        .then((response) => {
            console.log('Response status (add):', response.status);
            if (!response.ok) {
                // Mencoba membaca respons teks jika bukan JSON (untuk debug error server)
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then((data) => {
            console.log("Success add:", data);
            document.getElementById("keluhanInput").value = "";
            ambilData(); // Refresh daftar keluhan
            alert("✅ Keluhan berhasil dikirim!");
        })
        .catch((error) => {
            console.error("Error adding keluhan:", error);
            alert("❌ Gagal mengirim keluhan: " + error.message);
        });
});

// Fungsi untuk menghapus keluhan
function hapusKeluhan(googleSheetRowIndex) { // Nama parameter diganti agar lebih jelas
    if (!confirm("Apakah Anda yakin ingin menghapus keluhan ini?")) {
        return; // Batalkan jika user tidak yakin
    }

    const formData = new FormData();
    formData.append("action", "delete"); // Indikator untuk Apps Script bahwa ini aksi hapus
    formData.append("rowIndex", googleSheetRowIndex); // Mengirim nomor baris yang akan dihapus di Google Sheet

    console.log("Mengirim permintaan hapus untuk baris:", googleSheetRowIndex);

    fetch(scriptURL, {
            method: "POST", // Kita tetap gunakan POST untuk semua operasi
            body: formData,
        })
        .then((response) => {
            console.log('Response status (delete):', response.status);
            if (!response.ok) {
                // Mencoba membaca respons teks jika bukan JSON (untuk debug error server)
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then((data) => {
            console.log("Delete success response:", data);
            if (data.status === "success") {
                ambilData(); // Refresh daftar keluhan setelah hapus
                alert("✅ Keluhan berhasil dihapus!");
            } else {
                alert("❌ Gagal menghapus keluhan: " + (data.message || "Terjadi kesalahan yang tidak diketahui."));
            }
        })
        .catch((error) => {
            console.error("Error deleting keluhan:", error); // Log objek error lengkap
            alert("❌ Gagal menghapus keluhan: " + error.message);
        });
}

function ambilData() {
    console.log("Mengambil data keluhan...");
    fetch(scriptURL) // GET request
        .then((response) => {
            console.log('Response status (get):', response.status);
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then((data) => {
            console.log("Data retrieved:", data);
            const container = document.getElementById("keluhanList");
            container.innerHTML = "";

            if (Array.isArray(data) && data.length > 0) {
                // Menampilkan data dari yang terbaru
                // `data` dari Apps Script sudah di-shift (header dihilangkan).
                // Jadi, `data[0]` di frontend adalah baris ke-2 di GSheet.
                // `data[i]` di frontend adalah baris `i + 2` di GSheet.
                for (let i = data.length - 1; i >= 0; i--) {
                    if (Array.isArray(data[i]) && data[i].length >= 2) {
                        const keluhan = data[i][0];
                        const tanggal = data[i][1];

                        // Perhitungan nomor baris di Google Sheet.
                        // Jika `data` yang diterima sudah di-shift, maka index `i` di array ini
                        // sesuai dengan baris `i + 2` di Google Sheet (asumsi baris 1 adalah header).
                        // Karena kita looping terbalik, index asli di array data sebelum dibalik adalah `i`.
                        const googleSheetRowIndex = i + 2; 

                        const div = document.createElement("div");
                        div.className = "keluhan-item"; // Class untuk styling container keluhan
                        div.innerHTML = `
                            <div class="keluhan-content">
                                <p><strong>Anonyms:</strong> ${keluhan}</p>
                                <small>${tanggal}</small>
                            </div>
                            <button class="delete-btn" onclick="hapusKeluhan(${googleSheetRowIndex})">Hapus</button>
                        `;
                        container.appendChild(div);
                    } else {
                        console.warn("Data tidak sesuai format:", data[i]); 
                    }
                }
            } else {
                container.innerHTML = "<p>Belum ada keluhan.</p>";
            }
        })
        .catch((error) => {
            console.error("❌ Gagal ambil data:", error);
            container.innerHTML = "<p>Gagal memuat keluhan.</p>";
        });
}

// Inisialisasi: ambil data saat halaman dimuat
ambilData();