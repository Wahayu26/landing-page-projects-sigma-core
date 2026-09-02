# Deploy ke Rocky Linux 10.2

Panduan ini menargetkan server UAT `10.100.108.222` dengan Docker Compose. Port `443` pada server sudah digunakan service lain, sehingga deployment awal hanya membuka HTTP pada port `80` dan tidak mengubah service HTTPS yang ada.

## 1. Selesaikan akses Docker

User `clipanadmin` saat ini belum bisa mengakses `/var/run/docker.sock`. Pilihan paling aman untuk deployment pertama adalah menjalankan perintah Docker dengan `sudo`:

```bash
sudo docker ps
sudo docker compose version
```

Jika administrator server menyetujui akses Docker tanpa `sudo`, user dapat dimasukkan ke grup Docker. Keanggotaan grup ini setara dengan akses administratif ke host, jadi lakukan hanya dengan persetujuan pengelola server.

```bash
sudo usermod -aG docker clipanadmin
```

Setelah itu logout dari SSH, login kembali, lalu cek:

```bash
docker ps
```

Jangan mengubah permission socket dengan `chmod 666 /var/run/docker.sock`.

## 2. Identifikasi service port 443

Deployment ini tidak mengambil alih port `443`. Cari pemilik port tersebut untuk rencana integrasi HTTPS berikutnya:

```bash
sudo ss -lntp | grep ':443'
sudo systemctl --type=service --state=running | grep -Ei 'nginx|httpd|apache|haproxy|traefik'
```

Jika sudah ada reverse proxy perusahaan, nantinya domain dapat diarahkan dari proxy tersebut ke website ini. Jangan menghentikan service port `443` sebelum pemiliknya teridentifikasi.

## 3. Buat direktori aplikasi

```bash
sudo mkdir -p /opt/scs-company-profile
sudo chown -R clipanadmin:clipanadmin /opt/scs-company-profile
```

## 4. Buat paket source dari Windows

Jalankan dari root project menggunakan PowerShell:

```powershell
tar --exclude=.git --exclude=node_modules --exclude=.next --exclude=.data --exclude=.rollback --exclude=.env.local --exclude=.env.production -czf scs-company-profile.tar.gz .
scp .\scs-company-profile.tar.gz clipanadmin@10.100.108.222:/tmp/
```

Ekstrak di server:

```bash
tar -xzf /tmp/scs-company-profile.tar.gz -C /opt/scs-company-profile
cd /opt/scs-company-profile
chmod +x scripts/*.sh
```

## 5. Buat environment production

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Buat dua secret berbeda. Format hex digunakan agar aman di dalam PostgreSQL connection URL:

```bash
openssl rand -hex 32
openssl rand -hex 48
```

Edit file:

```bash
nano .env.production
```

Pastikan minimal berisi:

```dotenv
APP_VERSION=20260901-1
HTTP_PORT=80
NEXT_PUBLIC_SERVER_URL=http://10.100.108.222

POSTGRES_USER=scs
POSTGRES_PASSWORD=<hasil-openssl-32-byte>
POSTGRES_DB=postgres

PAYLOAD_SECRET=<hasil-openssl-48-byte-yang-berbeda>
PAYLOAD_DB_PROVIDER=postgres
PAYLOAD_DB_PUSH=false
```

Jangan mengirim atau menyimpan `.env.production` di Git.

## 6. Validasi konfigurasi

Jika user masih memerlukan `sudo`:

```bash
sudo docker compose --env-file .env.production -f compose.prod.yaml config --quiet
```

Jika tidak ada output, konfigurasi valid.

## 7. Build dan jalankan

Dengan akses Docker biasa:

```bash
./scripts/deploy-production.sh
```

Jika masih menggunakan `sudo`:

```bash
sudo ./scripts/deploy-production.sh
```

Script akan:

1. memvalidasi konfigurasi Compose;
2. membangun image Next.js/Payload dan Spring Boot;
3. menjalankan PostgreSQL;
4. menjalankan migrasi Payload PostgreSQL;
5. menjalankan migrasi Flyway saat Spring Boot startup;
6. menjalankan Nginx di port `80`.

Build pertama memerlukan akses internet dari server untuk menarik base image dan dependency.

## 8. Verifikasi container dan log

```bash
sudo docker compose --env-file .env.production -f compose.prod.yaml ps
sudo docker compose --env-file .env.production -f compose.prod.yaml logs --tail=200 postgres core-api web proxy
```

Semua service utama harus berstatus `running` atau `healthy`.

Verifikasi dari server:

```bash
curl -fsS http://127.0.0.1/nginx-health
curl -I http://127.0.0.1/
```

Verifikasi dari workstation:

```text
http://10.100.108.222
http://10.100.108.222/admin
```

Segera buat administrator pertama melalui `/admin/create-first-user` setelah deployment pertama.

## 9. Buka firewall HTTP jika diperlukan

Cek status Firewalld:

```bash
sudo firewall-cmd --state
sudo firewall-cmd --get-active-zones
```

Jika kebijakan infrastruktur mengizinkan akses HTTP ke server ini:

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

Koordinasikan perubahan firewall dengan administrator jaringan jika server dikelola tim infrastruktur.

## 10. Backup sebelum update

```bash
cd /opt/scs-company-profile
sudo ./scripts/backup-production.sh
```

Backup database dan media disimpan di `.backups/`. Salin backup penting ke lokasi lain agar tidak hanya berada pada server yang sama.

## 11. Update dan rollback

Untuk setiap release, naikkan `APP_VERSION`, misalnya:

```dotenv
APP_VERSION=20260901-2
```

Lakukan backup, upload source baru, lalu jalankan deployment script. Image versi sebelumnya tetap tersedia selama belum dihapus.

Jika aplikasi baru bermasalah tetapi migrasi database tetap kompatibel:

1. kembalikan `APP_VERSION` ke versi sebelumnya;
2. kembalikan source/config release sebelumnya;
3. jalankan:

```bash
sudo docker compose --env-file .env.production -f compose.prod.yaml up -d --no-build core-api web proxy
```

Jangan menjalankan `docker compose down -v`, karena opsi `-v` menghapus volume PostgreSQL dan media CMS. Jika rollback memerlukan pengembalian database, hentikan perubahan dan pulihkan backup secara terkontrol.

