# Forum API — CI/CD dan Security

Submission Dicoding berbasis Node.js 22, Express, PostgreSQL, dan Clean Architecture.
Proyek mempertahankan seluruh fitur Forum API sebelumnya, menjalankan pengujian
otomatis pada pull request, dan menyediakan deployment otomatis, rate limiting,
serta HTTPS melalui NGINX.

## Fitur API

- Registrasi, login, refresh access token, dan logout.
- Membuat thread serta melihat detail thread.
- Membuat dan soft-delete komentar.
- Membuat dan soft-delete balasan komentar.
- Menyukai/batal menyukai komentar melalui route yang sama.
- Menampilkan `likeCount` pada setiap komentar.
- Health check deployment melalui `GET /health`.

## Endpoint

| Method | Path | Access token |
| --- | --- | --- |
| POST | `/users` | Tidak |
| POST | `/authentications` | Tidak |
| PUT | `/authentications` | Tidak |
| DELETE | `/authentications` | Tidak |
| POST | `/threads` | Ya |
| GET | `/threads/{threadId}` | Tidak |
| POST | `/threads/{threadId}/comments` | Ya |
| DELETE | `/threads/{threadId}/comments/{commentId}` | Ya |
| PUT | `/threads/{threadId}/comments/{commentId}/likes` | Ya |
| POST | `/threads/{threadId}/comments/{commentId}/replies` | Ya |
| DELETE | `/threads/{threadId}/comments/{commentId}/replies/{replyId}` | Ya |

Endpoint terproteksi memakai header `Authorization: Bearer <accessToken>`.

## Menjalankan secara lokal

Persyaratan: Node.js 22 LTS dan PostgreSQL.

1. Buat database `forumapi` dan `forumapi_test`.
2. Salin `.env.example` menjadi `.env` dan `.test.env.example` menjadi `.test.env`.
3. Sesuaikan kredensial PostgreSQL dan JWT key.
4. Jalankan:

```bash
npm ci
npm run migrate up
npm run migrate:test up
npm run lint
npm run test:unit
npm run test:integration
npm run test:functional
npm run test:coverage
npm start
```

Server default berjalan pada `http://localhost:3000`.

## Continuous Integration

`.github/workflows/ci.yml` hanya berjalan pada pull request menuju `main` atau
`master`. Workflow membuat PostgreSQL service container lalu menjalankan migration,
lint, unit test, integration test, functional test, dan coverage test.

Untuk memenuhi bukti wajib Dicoding:

1. push branch fitur dengan satu test yang sengaja gagal;
2. buka pull request ke `main` dan tunggu CI merah;
3. perbaiki test tersebut pada branch yang sama dan push lagi;
4. tunggu CI hijau dan jangan menghapus run yang gagal;
5. merge pull request setelah seluruh pemeriksaan berhasil.

## Continuous Deployment

`.github/workflows/cd.yml` berjalan setiap ada push/merge ke `main` atau `master`.
Tambahkan repository secrets berikut:

| Secret | Contoh isi |
| --- | --- |
| `SERVER_HOST` | IP/domain server |
| `SERVER_PORT` | `22` |
| `SERVER_USER` | user SSH deployment |
| `SSH_PRIVATE_KEY` | private key user deployment |
| `DEPLOY_PATH` | `/var/www/forum-api` |
| `APP_URL` | `https://forum-api.domainmu.com` |

Server perlu memiliki Node.js 22, PostgreSQL, Git, NGINX, Certbot, file `.env`,
dan repository yang sudah di-clone pada `DEPLOY_PATH`. Salin
`deploy/forum-api.service` ke `/etc/systemd/system/forum-api.service`, sesuaikan
user/path bila perlu, lalu aktifkan service. User deployment juga harus diberi
izin menjalankan `sudo systemctl restart forum-api` tanpa prompt password.

## NGINX, limit access, dan HTTPS

File `nginx.conf` ada di root proyek sesuai kriteria. Konfigurasi tersebut:

- membatasi `/threads` dan seluruh nested path pada 90 request per menit;
- mengembalikan HTTP 429 untuk request berlebih;
- mengalihkan HTTP ke HTTPS;
- menggunakan TLS 1.2/1.3 dan HSTS;
- meneruskan request ke aplikasi pada port 3000.

Ganti `forum-api.example.com` dengan domain sebenarnya, terbitkan sertifikat
Let's Encrypt, salin konfigurasi ke `/etc/nginx/conf.d/forum-api.conf`, lalu jalankan:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Berkas submission

Jangan masukkan `.env`, `.test.env`, `node_modules`, atau `coverage` ke ZIP/repo.
Sertakan URL repository publik dan URL HTTPS API yang aktif pada student notes.

Contoh student notes:

```text
Repository: https://github.com/RezaHarahap/forum-api-cicd-security
Forum API HTTPS: https://forum-api.domainmu.com
CI: menu Actions > Continuous Integration (tersedia run gagal dan berhasil)
CD: menu Actions > Continuous Deployment (tersedia run berhasil)
```
