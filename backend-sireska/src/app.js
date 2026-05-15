// src/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const fasilitasRoutes = require("./routes/fasilitasRoutes");
const reservasiRoutes = require("./routes/reservasiRoutes"); 

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/fasilitas", fasilitasRoutes);
app.use("/api/reservasi", reservasiRoutes); 

module.exports = app;