# Forum API — CI/CD dan Keamanan

Repository publik: https://github.com/RezaHarahap/forum-api-cicd-security

Submission Dicoding berbasis Node.js 22, Express, PostgreSQL, dan Clean Architecture.
Proyek ini menjalankan unit, integration, serta functional test otomatis pada pull
request; melakukan deployment otomatis pada push ke branch utama; dan menyediakan
konfigurasi NGINX untuk HTTPS serta pembatasan akses `/threads` sebanyak 90 request
per menit.

## Fitur API

- Registrasi, login, refresh access token, dan logout.
- Membuat thread serta melihat detail thread.
- Membuat dan soft-delete komentar.
- Membuat dan soft-delete balasan komentar (opsional submission sebelumnya).
- Menyukai dan batal menyukai komentar melalui route yang sama.
- `likeCount` pada setiap komentar di detail thread.
- Health check untuk verifikasi deployment.
- Clean Architecture dan automated test lengkap.

## Persyaratan lokal

- Node.js 22 LTS
- PostgreSQL 13 atau lebih baru

## Menjalankan secara lokal

1. Buat database `forumapi` dan `forumapi_test`.
2. Salin `.env.example` menjadi `.env` dan `.test.env.example` menjadi `.test.env`.
3. Sesuaikan kredensial PostgreSQL dan kunci token.
4. Jalankan perintah berikut.

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

Server default berjalan pada `http://localhost:3000`. Health check tersedia di
`GET /health`.

## Endpoint

| Method | Path | Token |
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

Resource bertanda token menggunakan header `Authorization: Bearer <accessToken>`.

## Continuous Integration

Workflow `.github/workflows/ci.yml` berjalan khusus pada pull request menuju
`main` atau `master`. PostgreSQL service container dibuat otomatis dan workflow
menjalankan:

1. migration database test;
2. lint;
3. unit test;
4. integration test;
5. functional/server test;
6. coverage test.

Untuk memenuhi bukti Dicoding, simpan satu run pull request yang gagal, perbaiki
test/fiturnya pada branch yang sama, lalu simpan run berikutnya yang berhasil.
Jangan menghapus run gagal.

## Continuous Deployment

Workflow `.github/workflows/cd.yml` berjalan pada push ke `main` atau `master`.
Tambahkan Actions secrets berikut di repository:

| Secret | Isi |
| --- | --- |
| `SERVER_HOST` | IP/domain server |
| `SERVER_PORT` | Port SSH, biasanya `22` |
| `SERVER_USER` | User SSH deployment |
| `SSH_PRIVATE_KEY` | Private key untuk user deployment |
| `DEPLOY_PATH` | Path repository di server, misalnya `/var/www/forum-api` |

Server harus sudah memiliki Node.js 22, PostgreSQL, NGINX, Certbot, repository
yang telah di-clone, file `.env`, serta service `forum-api`. Contoh unit service
tersedia di `deploy/forum-api.service`. User deployment harus diizinkan menjalankan
`sudo systemctl restart forum-api` tanpa prompt password.

## NGINX, rate limit, dan HTTPS

File `nginx.conf` berada di root submission sesuai ketentuan. Sebelum dipasang:

1. ganti seluruh `forum-api.example.com` dengan domain/subdomain sebenarnya;
2. terbitkan sertifikat Let's Encrypt dengan Certbot;
3. salin file ke `/etc/nginx/conf.d/forum-api.conf`;
4. jalankan `sudo nginx -t` lalu reload NGINX.

Blok `location ^~ /threads` juga mencakup seluruh nested path dan menggunakan
zona `rate=90r/m`. Kelebihan permintaan mendapat status HTTP `429`. Semua akses
HTTP dialihkan ke HTTPS dan TLS dibatasi ke versi 1.2/1.3.

## Berkas rahasia

`.env`, `.test.env`, `node_modules`, dan hasil coverage tidak boleh dimasukkan ke
repository atau ZIP submission. Gunakan file contoh yang disediakan sebagai acuan.
