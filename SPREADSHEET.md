Berikut adalah dokumentasi struktur tabel dan kolom untuk setiap sheet yang ada di dalam file Google Sheets Anda:# Dokumentasi Struktur Data Google Sheets

## 1. Tabel: Sheet1

Berisi data kelolaan dana berdasarkan pegawai (Personal Number).\* **PN** : Nomor Induk Pegawai (Personal Number).

- **Nama_Pegawai** : Nama lengkap pegawai.
- **Kelolaan_Giro** : Nilai saldo kelolaan instrumen Giro.
- **Kelolaan_Tab** : Nilai saldo kelolaan instrumen Tabungan.
- **Kelolaan_Depo** : Nilai saldo kelolaan instrumen Deposito.
- **Tanggal_Data** : Tanggal pencatatan data.

## 2. Tabel: Data_Unit

Berisi informasi saldo berdasarkan unit kerja dan jenis produk.\* **Unit_KC** : Kode Unit Kerja atau Kantor Cabang.

- **Nama_Unit** : Nama Unit Kerja/Kantor Cabang.
- **Produk** : Jenis produk perbankan (misal: Giro).
- **Nilai** : Nilai saldo pada unit tersebut.
- **Tanggal_Data** : Tanggal pencatatan data.

## 3. Tabel: Keragaan_Cabang

Berisi ringkasan performa atau keragaan saldo per produk di tingkat cabang.\* **Produk** : Jenis produk perbankan.

- **Nilai** : Total nilai saldo produk tersebut.
- **Tanggal_Data** : Tanggal pencatatan data.

## 4. Tabel: RKA_Data

Berisi data Rencana Kerja dan Anggaran (Target).\* **Produk** : Jenis produk yang ditargetkan.

- **Nilai_RKA** : Nilai target anggaran (RKA).
- **Bulan_Tahun** : Periode target (Bulan dan Tahun).

## 5. Tabel: Pipeline_Data

Berisi data prospek atau rencana bisnis yang sedang berjalan.\* **NAMA_RMFT** : Nama Relationship Manager / Petugas terkait.

- **NAMA_NASABAH** : Nama calon nasabah atau nasabah eksisting.
- **PIPELINE** : Nilai potensi bisnis dalam pipeline.
- **KETERANGAN** : Jenis produk atau keterangan tambahan (misal: GIRO).
- **NOMINAL** : Nilai nominal transaksi (jika sudah terealisasi sebagian).
- **TANGGAL** : Tanggal pencatatan pipeline.

## 6. Tabel: Pencapaian_RMFT

Berisi detail pencapaian kinerja (KPI) dari RMFT berdasarkan berbagai parameter.\* **NAMA_RMFT** : Nama petugas RMFT.

- **BULAN** : Periode bulan pencapaian.
- **AVG_TAB** : Rata-rata saldo Tabungan.
- **AVG_GIRO** : Rata-rata saldo Giro.
- **AVG_DPK** : Rata-rata total Dana Pihak Ketiga (DPK).
- **FBI_PA** : Fee Based Income dari produk tertentu.
- **EDC_QRIS** : Pencapaian terkait mesin EDC atau QRIS.
- **DPK_MERCHANT** : Saldo DPK dari nasabah merchant.
- **SV** : Nilai Simpanan Valas atau parameter terkait.
- **NEW_PAYROLL** : Jumlah akuisisi payroll baru.
- **PROD_QLOLA** : Penggunaan produk platform Qlola.
- **PROG_KANWIL** : Pencapaian program Kantor Wilayah.
- **PROG_SGF** : Pencapaian program SGF.
- **TOTAL** : Total skor atau nilai pencapaian keseluruhan.
- **Kolom Tambahan/handle Jika pakai format lain** : `posisi_tab`, `casa_me`, `sv_edc`, `user_activ_b`, `user_activ_qlola`, `ph_program` (Parameter teknis pendukung perhitungan kinerja).

## 7. Tabel: Nasabah_Prioritas

Berisi data profil nasabah prioritas BRI beserta jenis usaha dan volume tabungan.

- **Nama_Nasabah** : Nama lengkap nasabah atau perusahaan.
- **Jenis_Usaha** : Bidang usaha nasabah (misal: Developer, Sawit, Koran).
- **Omset** : Total omset usaha nasabah (angka, tanpa titik/koma).
- **Produk_BRI** : Produk BRI yang digunakan (misal: TAB, GIRO, DEP).
- **Volume** : Volume/jumlah tabungan nasabah (angka bulat).
