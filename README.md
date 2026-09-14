# Forum API — CI/CD dan Security

Submission Dicoding berbasis Node.js 22, Express, PostgreSQL, dan Clean Architecture.
Proyek mempertahankan seluruh fitur Forum API sebelumnya, menjalankan pengujian
otomatis pada pull request, dan menyediakan deployment otomatis ke Vercel,
rate limiting terdistribusi, serta HTTPS. File NGINX tetap disertakan sebagai
artefak wajib submission dan alternatif deployment pada VPS.

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

`.github/workflows/cd.yml` berjalan setiap ada push/merge ke `main`. Workflow
menjalankan migrasi database, membangun aplikasi, melakukan production deployment
ke Vercel, lalu memverifikasi endpoint HTTPS `/health`.

### 1. Siapkan Vercel dan PostgreSQL cloud

1. Import repository ini sebagai project baru di Vercel.
2. Tambahkan PostgreSQL cloud (misalnya Neon) dan salin connection string-nya.
3. Tambahkan environment variables berikut pada Vercel Production:

| Variable | Isi |
| --- | --- |
| `DATABASE_URL` | connection string PostgreSQL cloud dengan SSL |
| `ACCESS_TOKEN_KEY` | random secret yang panjang |
| `REFRESH_TOKEN_KEY` | random secret berbeda |
| `ACCESS_TOKEN_AGE` | `3000` |

Vercel mendeteksi `server.js` sebagai aplikasi Express. Objek aplikasi diekspor
tanpa memanggil `listen()`, sehingga cocok dijalankan sebagai Vercel Function.

### 2. Tambahkan GitHub Actions secrets

Ambil Project ID dan Team/User ID dari halaman Project Settings Vercel. Buat
access token Vercel, lalu tambahkan secrets berikut di GitHub melalui
**Settings > Secrets and variables > Actions**:

| Secret | Contoh isi |
| --- | --- |
| `VERCEL_TOKEN` | access token Vercel |
| `VERCEL_ORG_ID` | Team ID atau User ID Vercel |
| `VERCEL_PROJECT_ID` | Project ID Vercel |
| `DATABASE_URL` | connection string yang sama dengan Vercel |

Setelah pull request di-merge ke `main`, workflow Continuous Deployment akan
berjalan otomatis. URL production Vercel sudah memakai HTTPS.

## NGINX, limit access, dan HTTPS

Rate limiter aplikasi memakai PostgreSQL sehingga hitungan tetap konsisten saat
Vercel menjalankan lebih dari satu instance. Semua request ke `/threads` dan nested
path dibatasi 90 request per menit per alamat IP dan request berlebih mendapat
HTTP 429.

File `nginx.conf` ada di root proyek sesuai kriteria submission. Jika aplikasi
dijalankan pada VPS, konfigurasi tersebut:

- membatasi `/threads` dan seluruh nested path pada 90 request per menit;
- mengembalikan HTTP 429 untuk request berlebih;
- mengalihkan HTTP ke HTTPS;
- menggunakan TLS 1.2/1.3 dan HSTS;
- meneruskan request ke aplikasi pada port 3000.

Untuk opsi VPS, ganti `forum-api.example.com` dengan domain sebenarnya, terbitkan
sertifikat Let's Encrypt, salin konfigurasi ke `/etc/nginx/conf.d/forum-api.conf`,
lalu jalankan:

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
Forum API HTTPS: https://nama-project.vercel.app
CI: menu Actions > Continuous Integration (tersedia run gagal dan berhasil)
CD: menu Actions > Continuous Deployment (tersedia run berhasil)
```
