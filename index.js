import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import { pool } from './src/pool.js';
import { router as apiRouter } from "./routes/api.js";
import { router as recogApiRouter } from "./routes/speech-recognize.js";
import morgan from "morgan";
import cors from "cors";

const app = express();
// cors
app.use(cors());

// log
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

// static files
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// promise pool
const promisePool = pool.promise();

// 首頁
app.get("/", (req, res) => {
    res.render("index");
});

// 語音辨識頁面
app.get("/recognize", (req, res) => {
    res.render("recognize", {
        title: "測試",
    });
});

// 測資上傳頁面
app.get("/upload", (req, res) => {
    res.render("upload");
});

// 手動 ner 頁面
app.get("/manualner", async (req, res) => {
    const sql = `
    SELECT
        *
    FROM
        ner_options
    WHERE
        option_name = 'ner_data_type'
    `;

    let [rows, fields] = await promisePool.query(sql);
    let data_type = rows[0]["option_value"];
    data_type === "paragraph"
        ? res.render("manualner")
        : res.render("manualner_article")
});

// 管理員頁面
app.get("/admin", (req, res) => {
    res.render("admin");
});

app.use("/api", apiRouter);
app.use("/api", recogApiRouter);

const port = 3000;
app.listen(port, () => {
    console.log(`Express server listening on port: ${port}...`);
});
