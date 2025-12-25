const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const UserModel = require("./model/User");

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error(err));

app.use(session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}));

const SHIFT = 3;

const encryptPassword = (text) => {
    let result = "";
    for (let char of text) {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            let base = code >= 65 && code <= 90 ? 65 : 97;
            result += String.fromCharCode(((code - base + SHIFT) % 26) + base);
        } else {
            result += char;
        }
    }
    return result;
};

const decryptPassword = (text) => {
    let result = "";
    for (let char of text) {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            let base = code >= 65 && code <= 90 ? 65 : 97;
            result += String.fromCharCode(((code - base - SHIFT + 26) % 26) + base);
        } else {
            result += char;
        }
    }
    return result;
};

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const encryptedPassword = encryptPassword(password);
        const user = await UserModel.create({
            name,
            email,
            password: encryptedPassword
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json("No Records found");

        const decryptedPassword = decryptPassword(user.password);
        if (password !== decryptedPassword) {
            return res.status(401).json("Password doesn't match");
        }

        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.json({ message: "Success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Failed to logout" });
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
    });
});

app.get("/user", (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json("Not authenticated");
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
