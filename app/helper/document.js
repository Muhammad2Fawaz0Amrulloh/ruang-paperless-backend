module.exports = {
    extractUniqueFields: (text) => {
        const fields = {};

        const nomorMatch = text.match(/Nomor\s*:\s*([\w./-]+)/);
        const halMatch = text.match(/Hal\s*:\s*(.*)/);
        const perihalMatch = text.match(/Perihal\s*:\s*(.*)/);
        const cityDateMatch = text.match(/([A-Za-z\s]+)\s*,\s*(\d{1,2}\s*[A-Za-z]+\s*\d{4})/);
        const penandaTanganMatch = text.match(/Penanda tangan\s*:\s*(.*)/);
        const kepadaMatch = text.match(/Kepada\s*([^\n]+)\n([^\n]+)\n([^\n]+)/); // Modified regex for "Kepada"

        if (nomorMatch) fields.nomor_surat = nomorMatch[1].trim();
        if (halMatch) {
            fields.perihal_surat = halMatch[1].trim();
        } else {
            if (perihalMatch) fields.perihal_surat = perihalMatch[1].trim();
        }
        if (kepadaMatch) {
            fields.tujuan_surat = kepadaMatch.slice(2).filter(Boolean).join(" ").trim() // Capture everything from index 1 to end
        }
        if (cityDateMatch) {
            const cityName = cityDateMatch[1].trim();
            const date = cityDateMatch[2].trim();
            fields.tanggal_surat = date;
            fields.kota_surat = cityName;
        }

        // Regex to match the position and name above the signature
        const signatoryMatches = text.match(/((?:Sekretaris Pimpinan|Sekretaris|Pimpinan|Ketua|Manager|Direktur)[^\n]*\n(?:[^\n]*\n)?[A-Za-z\s]+(?:[^\n]*))/g);

        if (signatoryMatches) {
            fields.PenandaTangan = signatoryMatches.map(match => {
                const lines = match.split('\n').map(line => line.trim());

                // Gabungkan semua baris untuk nama
                let nama = lines.slice(1).join(' ').trim();

                return {
                    jabatan: lines[0],
                    instansi: lines.length > 2 ? lines[1] : undefined,
                    nama: nama,
                };
            });
        } else if (penandaTanganMatch) {
            fields.PenandaTangan = [{ Nama: penandaTanganMatch[1].trim() }];
        }

        return fields;
    }
}