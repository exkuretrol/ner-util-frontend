import express from 'express';
import { pool } from '../src/pool.js';

const promisePool = pool.promise();
const router = express.Router();

/**
 * 輸出訓練模型用測資
 */
router.get("/output/:mode", async (req, res) => {
    const mode = req.params.mode;
    const sql = "select `測資手動NER` as json from ner_data_paragraph";
    const sql1 = "select `編號`, `語音辨識文字`, JSON_EXTRACT(`測資手動NER`, '$.tags') as tags from ner_data_paragraph";
    const sql2 = 'SELECT `編號` FROM `ner_data_paragraph` WHERE `測資手動NER` is null order by `編號`;';
    let resultA = await promisePool.query(sql)
        .then(([rows, fields]) => {
            return rows.map((_) => { return JSON.parse(_.json) });
        })

    let resultB = await promisePool.query(sql1)
        .then(([rows, fields]) => {
            return rows.map((_) => {
                let tokens = _.語音辨識文字.replace(/\s/g, '').split('');
                let tags = JSON.parse(_.tags);
                if (_.tags == null) return null;
                if (tokens.length !== tags.length) return null;
                return { "tokens": tokens, "tags": tags };
            })
        })
    resultA = resultA.filter(_ => _ !== null);
    resultB = resultB.filter(_ => _ !== null);

    switch (mode) {
        // 全部
        case '0':
            let output = Array.prototype.concat(resultA, resultB);
            res.json(output);
            break;

        // 只有輸入測資
        case '1':
            res.json(resultA);
            break;
        // 只有語音測資

        case '2':
            res.json(resultB);
            break;

        case 'l':
            let result = await promisePool.query(sql2)
                .then(([rows, fields]) => {
                    return rows.map(row => row.編號);
                });
            res.json(result);
            break;
            
        default:
            res.sendStatus(404);
            break;
    }

});

/**
 * 輸出 NER 種類
 */
router.get("/ner/category", async (req, res) => {
    const sql = "select * from ner_category";
    let result = await promisePool.query(sql)
    res.json(result[0]);
});

/**
 * 更新 NER 種類
 */
router.put('/ner/category', (req, res) => {
    let json = req.body;
    let sql = `UPDATE ner_category SET Name = '${json.Name}', Tag = '${json.Tag}' WHERE ID = ${json.ID};`
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
    });
    res.sendStatus(200);
})

/**
 * 刪除 NER 種類
 */
router.delete('/ner/category/:ID', (req, res) => {
    let ID = req.params.ID;
    let sql = `DELETE FROM ner_category WHERE ID = ${ID}`
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
    });
    res.sendStatus(200);
});

/**
 * 新增 NER 種類
 */
router.post('/ner/category', (req, res) => {
    let json = req.body;
    let sql = `INSERT INTO ner_category (ID, Name, Tag) VALUES (NULL, '${json.Name}', '${json.Tag}');`
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
    });
    res.sendStatus(200);
}) 

/**
 * 輸出網站選項
 */
router.get('/ner/option',async (req, res) => {
    const sql = "select * from ner_options";
    let result = await promisePool.query(sql)
    res.json(result[0]);
})

/**
 * 更新網站選項
 */
router.put('/ner/option', (req, res) => {
    const json = req.body;
    const sql = `UPDATE ner_options SET option_value = '${json.value}' WHERE option_name = '${json.name}';`
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
    });
    res.json({
        message: "更新成功"
    });
})

/**
 * 使用者測資數目
 */
router.get("/users/:userName", (req, res) => {
    let uname = req.params.userName;
    let sql = `select * from ( select count(*) as "全部測資" from ner_data_paragraph) a, ( select count(*) as "某人的測資" from NER_data where 你是誰 = "${uname}") b`;
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
        res.json(result[0]);
    });
});

/**
 * 使用者新增測資
 */
router.post("/users/:userName", (req, res) => {
    let uname = req.params.userName;
    let results = req.body;
    let sql = `INSERT INTO ner_data_paragraph (你是誰, 測資文字, 語音辨識文字, 語音辨識注音, 語音檔路徑, 產生時間) VALUES ("${uname}", "${results.text}", "${results.transcript}", "${results.zhuyin}", "${results.filePath}", current_timestamp())`;
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
    });
    res.sendStatus(200);
});

/**
 * 取回測資
 */
router.get("/data/:no", (req, res) => {
    const no = req.params.no;
    let sql = `select * from ner_data_paragraph where 編號 = ${no}`
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
        res.json(result[0]);
    });
});

/**
 * 更新測資
 */
router.put('/data', (req, res) => {
    let json = req.body;
    let json_string = JSON.stringify(json.json);
    let sql = `UPDATE ner_data_paragraph SET 測資手動NER = '${json_string}' WHERE 編號 = ${json.no};`
    pool.query(sql, (error, result, fields) => {
        if (error) throw error;
    });
    res.sendStatus(200);
})

export { router };