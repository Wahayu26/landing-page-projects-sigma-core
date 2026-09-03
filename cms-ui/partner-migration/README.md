# Import partner ke CMS testing

Scope: hanya `.rollback/cms-ui-preview`, SQLite `cms-ui-preview.db`, web port 3101.
Tidak memigrasikan production/PostgreSQL, akun, solusi, proyek, Insight atau settings.

## Hasil 3 September 2026

- Backup database dan media: `.rollback/backups/cms-partners-before-import-20260903-105527/`.
- Sebelum impor: **0 partner**, 1 upload `Dedsec Logo.jpg` beserta thumbnail-nya.
  Data partner DedSec dibuat kembali menggunakan upload yang sama (media ID 1).
- Sesudah impor: **21 partner published** = 20 partner dari `content/site.ts` + DedSec.
- Urutan partner lama 1–20, DedSec 21; URL website tidak dikarang/ditambahkan.
- 20 logo masuk koleksi Media via Payload Local API, bukan SQL insert manual.
- File lama, data upload DedSec dan 21 tabel di luar partner/media terverifikasi
  identik dengan backup. File sumber statis tidak dihapus.
- Laporan dry-run dan apply tersimpan bersama backup; tidak berisi password.

## Cara kerja dan keamanan

`import-partners.mjs` melakukan preflight semua aset sebelum menulis. Nama yang
sudah ada (case-insensitive) dilewati, termasuk status tayang dan urutan yang
sudah dipilih pengguna. Upload identik dapat dipakai ulang. Impor tidak melakukan
update/delete dan aman diulang. Jika proses terputus, data yang sudah berhasil
dibuat tetap ada; periksa laporan lalu jalankan ulang. Backup tetap disimpan.

`run-testing-import.ts` hanya mengizinkan lokasi dan database testing tersebut,
schema push harus mati, dan folder backup harus tersedia. Salin runner serta
`import-partners.mjs` ke `scripts/` CMS preview sebelum menjalankan Payload CLI.
Default adalah dry-run; `CMS_PARTNER_IMPORT_APPLY=true` baru mengaktifkan impor.
Jalankan saat server testing dihentikan agar backup dan verifikasi konsisten.
Tidak menyediakan mode production.

## Perbaikan logo

```sh
node cms-ui/partner-migration/apply-image-fix.mjs .rollback/cms-ui-preview
```

Helper media pada source CMS lama memakai `/api/media/file/<encoded filename>`
untuk upload lokal. Next Image mengoptimalkan melalui route internal yang sama,
tanpa menambahkan wildcard remotePatterns atau mengizinkan akses private IP.
Tidak mengubah URL/file dalam database. Perlu build ulang agar berlaku.
Patch ini untuk CMS + frontend legacy dalam satu app, bukan frontend terpisah
port 3000. Untuk frontend terpisah diperlukan integrasi CMS tersendiri.

## Validasi

```sh
node --test cms-ui/partner-migration/import-partners.test.mjs
node cms-ui/partner-migration/verify-local-import.mjs .rollback/backups/cms-partners-before-import-20260903-105527
node cms-ui/partner-migration/verify-testing-http.mjs
```

`verify-local-import.mjs` membuka kedua SQLite secara read-only, membandingkan
tabel yang tidak terkait, upload lama, serta jumlah/status partner.

Validasi selesai: 7 tes unit lulus, build/TypeScript berhasil, dry-run ulang
merencanakan 0 penambahan, dan semua 21 logo original + optimized merespons HTTP
200. HTML landing page memuat 21 nama partner unik. Duplikasi visual pada track
logo adalah pengulangan marquee bawaan, bukan duplikasi data CMS.

Database dan media pengguna sengaja tidak dimasukkan Git atau paket patch UI.
Untuk deploy production nantinya, rencanakan impor database/media terpisah;
push/pull Git tidak memindahkan data ini. Jangan hapus direktori preview/backup
sebelum data testing yang ingin dipertahankan sudah diekspor.
