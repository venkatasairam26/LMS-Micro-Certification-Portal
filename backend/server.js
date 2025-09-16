const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { open } = require("sqlite");

app.use(cors());
app.use(express.json());

const dbPath = path.join(process.cwd(), "database.db");
let db;

async function initDB() {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        app.listen(4000, () => {
            console.log("Server started on port 4000");
        });
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            quizTaken boolean NOT NULL,
            password TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quizId INTEGER NOT NULL,
            questionText TEXT NOT NULL,
            options TEXT NOT NULL,
            correctAnswer TEXT NOT NULL
        );`)

        db.run(`CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            quizId INTEGER NOT NULL,
            score INTEGER NOT NULL,
            date TEXT DEFAULT (datetime('now'))
        );`)


    } catch (error) {
        console.error("Error opening database:", error);
    }

}

initDB();

const authToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "secret_key", (err, payload) => {
            if (err) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            req.user = payload;
            next();
        });
    } else {
        return res.status(401).json({ error: "Unauthorized" });
    }
}

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    const getUser = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    if (getUser) {
        return res.status(400).json({ error: "User already exists" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUser = await db.run(`INSERT INTO users (name, email, password,quizTaken) VALUES (?, ?, ?,?)`, [name, email, hashedPassword, false]);
        const token = jwt.sign({ id: insertUser.lastID }, "secret_key");
        res.status(201).json({ message: "User registered successfully",token });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const getUser = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!getUser) {
        return res.status(400).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, getUser.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password" });
    }
    const token = jwt.sign({ id: getUser.id }, "secret_key");
    res.json({ token });
})

app.get('/quiz', authToken, async (req, res) => {
    const getUser = await db.get(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
    if (!getUser) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (getUser.quizTaken) {
        const query = `
  SELECT qr.id,
         qr.quizId,
         qr.score,
         qr.date,
         u.name AS userName
        FROM quiz_results qr
        JOIN users u ON qr.userId = u.id
        WHERE qr.userId = ?
        `;
        const results = await db.all(query, [req.user.id]);
        return res.status(200).json(results);
    }
    const getQuiz = await db.all(`SELECT * FROM quiz_questions`);
    return res.status(200).json(getQuiz);
})

app.get('/score', authToken, async (req, res) => {
    const getScore = await db.all(`SELECT 
    qr.id,
    u.name,
    qr.quizId,
    qr.score,
    RANK() OVER (PARTITION BY qr.quizId ORDER BY qr.score DESC) AS rank
    FROM quiz_results qr
    JOIN users u ON qr.userId = u.id;
    `);
    return res.status(200).json(getScore);
})

app.post('/quiz_results', authToken, async (req, res) => {
    const { quizResult } = req.body;
    const userId = req.user.id;
    const { quizId, score } = quizResult;
    try {
        await db.exec('BEGIN TRANSACTION');
        await db.run(`UPDATE users SET quizTaken = ? WHERE id = ?`, [true, userId]);
        const insertScore = await db.run(`INSERT INTO quiz_results (userId, quizId, score) VALUES (?, ?, ?)`, [userId, quizId, score]);
        await db.exec('COMMIT');
        return res.status(201).json({ message: "Score saved successfully", id: insertScore?.lastID });
    } catch (e) {
        try { await db.exec('ROLLBACK'); } catch (_) {}
        console.error('Failed to save quiz result:', e);
        return res.status(500).json({ error: 'Failed to save quiz result' });
    }
})
