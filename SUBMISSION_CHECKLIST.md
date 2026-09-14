# Checklist Submission CI/CD dan Security

## Sudah diterapkan di dalam proyek

- [x] CI memakai GitHub Actions dan terpicu oleh pull request ke `main`/`master`.
- [x] CI menjalankan lint, unit, integration, functional, dan coverage test.
- [x] CI memakai PostgreSQL service container.
- [x] CD terpicu oleh push ke `main`/`master`.
- [x] CD melakukan deploy SSH, migration, restart service, dan HTTPS health check.
- [x] `nginx.conf` tersedia pada root proyek.
- [x] `/threads` dan nested path dibatasi 90 request per menit.
- [x] HTTP dialihkan ke HTTPS; TLS 1.2/1.3 dikonfigurasi.
- [x] Fitur users, authentications, threads, comments, dan replies dipertahankan.
- [x] Fitur opsional like/unlike komentar serta `likeCount` diterapkan.
- [x] `.env`, `.test.env`, `node_modules`, dan coverage dikecualikan dari paket.

## Wajib diselesaikan pada GitHub/server sebelum submit

- [ ] Upload seluruh source code ke repository publik.
- [ ] Buat pull request dan pertahankan satu riwayat CI gagal.
- [ ] Perbaiki branch sampai terdapat satu riwayat CI berhasil.
- [ ] Merge pull request agar CD terpicu.
- [ ] Isi seluruh GitHub Actions secrets yang disebutkan di README.
- [ ] Pastikan run Continuous Deployment berhasil.
- [ ] Ganti domain placeholder pada `nginx.conf`.
- [ ] Pasang sertifikat HTTPS dan pastikan URL dapat diakses publik.
- [ ] Jalankan seluruh Forum API V2 Postman Collection terhadap URL HTTPS.
- [ ] Lampirkan URL repository dan URL HTTPS pada student notes.

Jangan mencentang checklist review mandiri Dicoding sebelum semua butir bagian
kedua benar-benar sudah terpenuhi dan dapat diperiksa oleh reviewer.
