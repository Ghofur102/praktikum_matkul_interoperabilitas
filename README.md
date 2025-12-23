# 🎬 Movie API Server

Backend API berbasis Node.js dan Express untuk pengelolaan data film dan sutradara. Proyek ini menggunakan SQLite sebagai database dan menerapkan sistem autentikasi JWT (JSON Web Token) dengan pembagian hak akses (Role-Based Access Control) antara User dan Admin.

## ✨ Fitur

* **Autentikasi & Otorisasi**: Registrasi dan Login aman menggunakan hashing password (bcrypt) dan JWT.
* **Role Management**:
    * **Public**: Akses baca (read-only) untuk daftar film dan sutradara.
    * **User**: Dapat menambah data film dan sutradara.
    * **Admin**: Hak akses penuh untuk mengedit dan menghapus data.
* **Database Ringan**: Menggunakan SQLite yang tidak memerlukan instalasi server database terpisah.
* **Auto-Seeding**: Database dan tabel otomatis dibuat saat server dijalankan pertama kali.

## 🛠️ Teknologi

* **Node.js** & **Express.js**
* **SQLite3**
* **Bcryptjs** & **JSON Web Token**
* **Dotenv**

---

## 🚀 Panduan Instalasi & Penggunaan

### 1. Prasyarat
Pastikan Anda telah menginstal:
* [Node.js](https://nodejs.org/) (v14+)
* NPM

### 2. Instalasi Dependencies
Buka terminal di folder proyek dan jalankan:
```bash
npm install express cors dotenv sqlite3 bcryptjs jsonwebtoken
