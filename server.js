// import .env
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
// import database
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3200;

// import middleware dari authMiddleware.js
const authenticateToken = require('./middleware/authMiddleware.js');

// middleware
app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => {
    res.status(200).json({
        ok: true,
        status: `Server is running.`,
        service: 'Movie API',
    });
});

// auth register
app.post('/auth/register', (req, res) => {
    const {username, password} = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({
            error: "Invalid username or password",
        });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("error hashing: ", err);
            return res.status(500).json({
                error: "Gagal memproses pendaftaran",
            });
        }

        const sql = "INSERT INTO users(username, password) VALUES (?, ?)";
        const params = [username.toLowerCase(), hashedPassword];
        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint")) {
                    return res.status(409).json({
                        error: "Username already exists",
                    });
                }
                console.error("Error inserting user: ", err);
                return res.status(500).json({
                    error: "Gagal memproses pendaftaran"
                });
            }
            res.status(201).json({
                message: "User registered successfully",
                userId: this.lastID,
            });
        });
    })
});

// auth login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            error: "Username or password is missing",
        });
    }
    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username.toLowerCase()], (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: "Username or password is incorret",
            });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({
                    error: "Username or password is incorrect.",
                });
            }
            const payload = {
                user: {
                    id: user.id,
                    username: user.username,
                    password: user.password
                }
            };
            jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to generate token" });
                }
                res.json({ message: "Login successful", token: token, user: user });
            });
        });
    });
});

app.get('/movies', (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({
                "error": err.message
            });
        }
        res.status(200).json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/directors', (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({
                "error": err.message
            });
        }
        res.status(200).json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/movies/:id', (req, res) => {
    const sql = "SELECT * FROM movies WHERE id = ?";
    db.all(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({
                "error": err.message
            });
        }

        if (row.length === 0) {
            return res.status(404).json({
                "message": "Film tidak ditemukan!",
            });
        }

        res.status(200).json({
            "message": "success",
            "data": row
        });
    });
});

app.get("/directors/:id", (req, res) => {
    const sql = "SELECT * FROM directors WHERE id = ?";
    db.all(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({
                "message_error": err.message
            });
        }

        if (row.length === 0) {
            return res.status(404).json({
                "message": "Film tidak ditemukan!",
            });
        }

        res.status(200).json({
            "message": "success",
            "data": row
        });
    });
});

app.post("/movies", authenticateToken, (req, res) => {
    console.log('Request POST /movies oleh user: ', req.user.username);
    const { title, director, year } = req.body;
    if (!title || !director || !year) {
        return res.status(404).json({
            "error": "semua field harus diisi!"
        });
    }

    const sql = "INSERT INTO movies (title, director, year) VALUES (?, ?, ?)";
    db.run(sql, [title, director, year], function (err) {
        if (err) {
            return res.status(500).json({
                "error": err.message
            });
        }
        res.status(201).json({
            "message": "berhasil menambahkan data film!",
            "data": {
                "id": this.lastID,
                "title": title,
                "director": director,
                "year": year
            }
        });
    });
});


app.post("/directors", authenticateToken, (req, res) => {
    console.log('Request POST /directors oleh user: ', req.user.username);
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(404).json({
            "error": "semua field harus diisi!"
        });
    }

    const sql = "INSERT INTO directors (name, birthYear) VALUES (?, ?)";
    db.run(sql, [name, birthYear], function (err) {
        if (err) {
            return res.status(500).json({
                "error": err.message
            });
        }
        res.status(201).json({
            "message": "berhasil menambahkan data director!",
            "data": {
                "id": this.lastID,
                "name": name,
                "birthYear": birthYear
            }
        });
    });
});

app.put("/movies/:id", authenticateToken, (req, res) => {
    const { title, director, year } = req.body;
    const sql = "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?";
    db.run(sql, [title, director, year, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({
                "message": err.message
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                "message": "data tidak ditemukan!"
            })
        }
        res.status(200).json({
            "message": "berhasil mengubah data!",
            "data": {
                "id": Number(req.params.id),
                "title": title,
                "director": director,
                "year": year
            }
        });
    });
});

app.put("/directors/:id", authenticateToken, (req, res) => {
    const { name, birthYear } = req.body;
    const sql = "UPDATE directors SET name = ?, birthYear = ? WHERE id = ?";
    db.run(sql, [name, birthYear, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({
                "message": err.message
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                "message": "data tidak ditemukan!"
            })
        }
        res.status(200).json({
            "message": "berhasil mengubah data!",
            "data": {
                "id": Number(req.params.id),
                "name": name,
                "birthYear": birthYear
            }
        });
    });
});

app.delete('/movies/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM movies WHERE id = ?";
    db.run(sql, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({
                "message": err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                "message": "data tidak ditemukan!",
            })
        }

        res.status(204).send();
    });
});

app.delete('/directors/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM directors WHERE id = ?";
    db.run(sql, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({
                "message": err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                "message": "data tidak ditemukan!",
            })
        }

        res.status(204).send();
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
});

