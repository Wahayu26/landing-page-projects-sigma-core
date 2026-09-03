# Sigma Core CMS — perbaikan tampilan

Patch khusus CMS Payload 3.88 / Next.js 16.3.3 yang masih berjalan di
`scs-company-profile-web-1`, image `scs/web:20260901-2`.
Frontend terbaru di repo ini sudah tidak memuat Payload; build frontend biasa
tidak akan mengubah tampilan CMS.

## Perubahan

- Tinggi header dan offset konten mengikuti satu variabel Payload.
- Slot logo breadcrumb cukup besar sehingga ikon tidak terpotong.
- Sidebar, menu aktif, dashboard, pencarian, dan form mengikuti tema terang/gelap.
- Grid dashboard dan navigasi mengikuti lebar layar desktop/ponsel.
- Logo header, sidebar, login dan favicon menggunakan `public/assets/scs-icon.png`
  yang sama dengan aset landing page. URL favicon diberi versi untuk cache.
- Tombol **Lihat website** mengarah ke `https://sigmacore.id/`, bukan root subdomain CMS.
- Preferensi tema tetap menggunakan **Akun → Tema Admin → Terang/Gelap/Otomatis**.

Tidak mengubah collections, access control, password, database, media uploads,
SMTP, konfigurasi proxy, atau migrasi. Tidak menjalankan create-user/seed pada server.

## File

`overlay/app/(payload)/custom.scss` adalah stylesheet CMS pengganti.
`overlay/cms/components/AdminIcon.tsx` dan `AdminLogo.tsx` adalah komponen branding.
`apply.mjs` menyalin overlay dan menambah branding/metadata pada source CMS lama.
Script menolak source frontend/incompatible dan aman dijalankan ulang.

Untuk source CMS terpisah yang masih sesuai baseline:

```sh
node /path/to/cms-ui/apply.mjs /path/to/legacy-cms-source
```

Jalankan hanya pada salinan source/build stage, bukan langsung dalam container aktif.
Perubahan source harus diikuti build image baru.

## Build image di server (belum mengganti container aktif)

Upload paket `cms-ui-20260903.tar.gz` ke `/tmp` menggunakan WinSCP.
Lalu, melalui terminal server:

```sh
cms_ui_dir=$(mktemp -d /opt/scs-company-profile/cms-ui-20260903.XXXXXX)
tar -xzf /tmp/cms-ui-20260903.tar.gz -C "$cms_ui_dir"
docker image inspect scs/web:20260901-2 --format '{{.Id}}'
docker build --pull=false \
  --build-arg CMS_BASE_IMAGE=scs/web:20260901-2 \
  -t scs/cms:ui-20260903 "$cms_ui_dir/cms-ui"
```

Dockerfile menggunakan source dan dependencies dari image CMS lama. Build memakai
SQLite sementara tanpa kredensial production. Warning SMTP localhost dan
fallback konten dari database SQLite kosong dapat muncul saat prerender frontend
legacy; build harus tetap berakhir sukses. Hasilnya mempertahankan non-root user,
command, port, dan healthcheck dari image dasar.

**Belum otomatis deploy.** Dockerfile belum dijalankan terhadap image Linux server
di komputer pengembangan ini. Validasi image baru sebelum cutover.

Untuk cutover, pertahankan konfigurasi runtime container CMS yang sudah bekerja:
env/secret, PostgreSQL, mount media, network dan nama/alias upstream Nginx.
Simpan image serta konfigurasi lama untuk rollback. Jangan menjalankan Compose
frontend untuk menggantikan CMS, `down -v`, atau prune volumes.

Karena CMS lama pernah dipulihkan dan network proxy disambungkan manual,
periksa mount/network aktif sebelum menulis perintah penggantian container:

```sh
docker inspect scs-company-profile-web-1 --format 'Image={{.Config.Image}} User={{.Config.User}}'
docker inspect scs-company-profile-web-1 --format '{{json .Mounts}}'
docker inspect scs-company-profile-web-1 --format '{{json .NetworkSettings.Networks}}'
```

Jangan membagikan `.Config.Env`, `.env.production`, password, atau token ke chat.
Sesudah cutover, verifikasi login, kedua tema, gambar media dan endpoint CMS;
refresh tab agar favicon versi baru dimuat.

## Validasi lokal

```sh
node --test cms-ui/apply.test.mjs
```

Empat tes: patch branding, backend config tetap, idempotensi/CRLF, penolakan source
tidak cocok dan source frontend. Preview dijalankan pada salinan source Git
`8bfdd32` di `.rollback/cms-ui-preview`, dengan SQLite dan akun dummy terisolasi.
Database/akun dummy tidak ikut paket.

- `pnpm build` dan pemeriksaan TypeScript berhasil.
- Build ulang tanpa database CMS production juga berhasil (fallback legacy).
- Inspeksi browser: dashboard, enam collection lists, editor Insight,
  pengaturan website dan akun; kedua tema serta header/sidebar pada desktop/mobile.
- Ikon favicon: `/assets/scs-icon.png?v=cms-ui-1`; header 76px desktop / 64px mobile.

Preview bukan bukti deploy ke `cms.sigmacore.id`; production baru berubah setelah
image baru berhasil diuji dan container CMS diganti.
