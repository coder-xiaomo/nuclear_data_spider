const express = require('express');
const mysql = require('mysql');
const app = express();

// 创建连接池
const pool = mysql.createPool({
    connectionLimit: 5, // 设置连接池的大小
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'open_data'
});

// 设置跨域访问
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


// app.get('/nuclear_data/options', function (req, res) {
//     // 从连接池中获取一个连接
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             console.error(err);
//             res.status(500).send('服务器错误');
//         } else {
//             // 查询数据库，获取所有的名称和位置，去重
//             // let sql = `SELECT DISTINCT name, location FROM nuclear_data`;
//             let sql = `SELECT DISTINCT name FROM nuclear_data`;
//             connection.query(sql, function (err, result) {
//                 if (err) {
//                     console.error(err);
//                     res.status(500).send('服务器错误');
//                 } else {
//                     // 返回查询结果
//                     res.json(result);
//                 }
//                 // 释放连接
//                 connection.release();
//             });
//         }
//     });
// });

app.post('/nuclear_data/options/names', function (req, res) {
    // 获取请求参数
    let type = req.body?.type;

    // 从连接池中获取一个连接
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error(err);
            res.status(500).send('服务器错误');
        } else {
            // 查询数据库，获取指定名称下的所有位置，去重
            let sql = `SELECT DISTINCT name FROM nuclear_data WHERE type = ? ORDER BY name`;
            connection.query(sql, [type], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send('服务器错误');
                } else {
                    // 返回查询结果
                    res.json(result);
                }
                // 释放连接
                connection.release();
            });
        }
    });
});

app.post('/nuclear_data/options/locations', function (req, res) {
    // 获取请求参数
    let type = req.body?.type;
    let name = req.body?.name;

    // 从连接池中获取一个连接
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error(err);
            res.status(500).send('服务器错误');
        } else {
            // 查询数据库，获取指定名称下的所有位置，去重
            let sql = `SELECT DISTINCT location FROM nuclear_data WHERE type = ? AND name = ? ORDER BY location`;
            connection.query(sql, [type, name], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send('服务器错误');
                } else {
                    // 返回查询结果
                    res.json(result);
                }
                // 释放连接
                connection.release();
            });
        }
    });
});

app.post('/nuclear_data', function (req, res) {
    // 获取请求参数
    let name = req.body?.name;
    let location = req.body?.location;
    let date = req.body?.date;

    // console.log('param', name, location, date)

    // 从连接池中获取一个连接
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error(err);
            res.status(500).send('服务器错误');
        } else {
            // 查询数据库
            // let sql = `SELECT * FROM nuclear_data WHERE name = ? AND location = ? AND date = ?`;
            let sql = `SELECT * FROM nuclear_data WHERE name = ? AND location = ? AND date BETWEEN DATE_SUB(?, INTERVAL 3 DAY) AND ? ORDER BY date`;
            connection.query(sql, [name, location, date, date], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send('服务器错误');
                } else {
                    // 返回查询结果
                    res.json(result);
                }
                // 释放连接
                connection.release();
            });
        }
    });
});

// 开放接口
app.post('/api/nuclear_data/export', function (req, res) {
    // 获取请求参数
    let year = req.body?.year;
    let month = req.body?.month;
    // let day = req.body?.day;

    if (!year || !month || year.indexOf('.') != -1 || month.indexOf('.') != -1) {
        res.status(400).send('参数错误');
    }

    year = Number(year);
    month = Number(month);

    if (isNaN(year) || isNaN(month) || year < 2023 || year > 3000 || month < 1 || month > 12) {
        res.status(400).send('参数错误');
        return
    }

    // if (day) {
    //     if (day.indexOf('.') != -1) {
    //         res.status(400).send('参数错误');
    //     }
    //     day = Number(day);
    //     if (isNaN(day) || day < 1 || day > 31) {
    //         res.status(400).send('参数错误');
    //         return
    //     }
    // }

    // console.log('param', name, location, date)

    // 从连接池中获取一个连接
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error(err);
            res.status(500).send('服务器错误');
        } else {
            // 查询数据库
            let sql = `SELECT date,type,name,location,value FROM nuclear_data WHERE YEAR(date) = ? AND MONTH(date) = ? ORDER BY date,type,name,location`;
            connection.query(sql, [year, month], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send('服务器错误');
                } else {
                    // 返回查询结果
                    res.json(result.map(i => {
                        if (i.date) {
                            let date = new Date(i.date)
                            let year = date.getFullYear();
                            let month = date.getMonth() + 1;
                            if (month < 10) month = `0${month}`
                            let day = date.getDate();
                            if (day < 10) day = `0${day}`
                            i.date = year + "-" + month + "-" + day;
                            // i.date2 = new Date(new Date(i.date).getTime() + 8 * 3600 * 1000).toISOString().substring(0, 10)
                        }
                        return i
                    }));
                }
                // 释放连接
                connection.release();
            });
        }
    });
});

// 启动服务器
app.listen(3000, function () {
    console.log('Server is running on port 3000');
});
