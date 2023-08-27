// 导入需要的模块
const request = require('request');
const fs = require('fs');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const mysql = require('mysql');

// 要爬取的网页地址
// https://data.rmtc.org.cn/gis/PubIndexM.html?type=0
// https://data.rmtc.org.cn/gis/PubIndexM.html?type=1

const mysqlConfig = {
    host: 'localhost', // 数据库地址
    user: 'root', // 数据库用户名
    password: '123456', // 数据库密码
    database: 'open_data' // 数据库名称
}

// main()
async function main() {
    try {
        await doFetch('0')
    } catch (err) {
        console.error('type=0 爬取时出现错误，正在重试...')
        try {
            await doFetch('0')
        } catch (err) {
            console.error('type=0 爬取时出现错误，爬取失败')
        }
    }
    try {
        await doFetch('1')
    } catch (err) {
        console.error('type=1 爬取时出现错误，正在重试...')
        try {
            await doFetch('1')
        } catch (err) {
            console.error('type=1 爬取时出现错误，爬取失败')
        }
    }
    console.log('爬取完成')
}

//
async function doFetch(type) {
    const url = 'https://data.rmtc.org.cn/gis/PubIndexM.html?type=' + type
    await new Promise((resolve, reject) => {
        // 发送请求，获取网页内容
        request(url, async (error, response, body) => {
            if (error) {
                console.error(error);
                // return
                reject()
            }

            // fs.writeFileSync('output/html.json', body, 'utf-8');

            // 使用dom模块解析body内容，生成文档对象
            const doc = new dom().parseFromString(body);

            // 修改了这个xpath表达式，用li标签而不是text()，因为text()会匹配所有文本节点，包括空白和换行
            const lis = xpath.select("//ul[@data-role='listview']/li", doc);

            // 定义一个空数组，用于存储转换后的数据
            const data = [];

            const childrenPage = [];

            // 遍历提取到的数据，将其转换为对象，并存入数组中
            for (let i = 0; i < lis.length; i++) {
                const li = lis[i]

                /*
                <li><a data-ajax="false" href="PubStationlistM.html?type=1&id=2410283902&">
                <h2><span class="epfy">红沿河核电厂</span> (<span class="epfy">复州城</span>)</h2>
                <p>
                <span class="span-count">83 nGy/h</span>
                <span class="showtime">2023-08-25</span> &nbsp;  </p>
                </a>

                </li>
                 */
                // 使用nodeValue属性获取文本内容
                const name = xpath.select1(".//h2/span[@class='epfy'][1]/text()", li).nodeValue.trim();
                const location = xpath.select1(".//h2/span[@class='epfy'][2]/text()", li).nodeValue.trim();
                const value = xpath.select1(".//p/span[@class='span-count']/text()", li).nodeValue.trim();
                const date = xpath.select1(".//p/span[@class='showtime']/text()", li).nodeValue.trim();

                // 使用正则表达式匹配type和id的值
                const href = xpath.select1("./a/@href", li).nodeValue.trim();
                const regex = /type=(\d+)&id=(\d+)/;
                const match = regex.exec(href);
                const type = match[1];
                const id = match[2];

                // 创建一个对象，存储每一条数据
                const item = {
                    name,
                    location,
                    value,
                    date,
                    parent_id: null,
                    type,
                    id
                };
                // 将对象推入数组中
                data.push(item);

                childrenPage.push({ type, id, href, name })
            }
            // 打印转换后的数据
            // console.log(data);
            // console.log('主表数据完成', JSON.stringify(data));
            console.log('主表数据完成');

            saveToDb(data)
            // fs.writeFileSync('output/data.json', JSON.stringify(data, null, 4), 'utf-8');

            console.log('childrenPage', childrenPage)
            for (let page of childrenPage) {
                console.log('#######################################################')
                console.log('page', page)
                await doFetch2(page.type, page.id, page.name, page.href)
                console.log('#######################################################')
                await new Promise((resolve) => {
                    setTimeout(resolve, 1000)
                })
            }

            resolve()
        });
    })
}


async function doFetch2(parentType, parentId, parentName, relativeUrl) {
    const url = 'https://data.rmtc.org.cn/gis/' + relativeUrl
    // 发送请求，获取网页内容
    let data = await new Promise((resolve) => {
        request(url, (error, response, body) => {
            if (error) {
                console.error(error);
                return
            }

            const doc = new dom().parseFromString(body);
            const lis = xpath.select("//ul[@data-role='listview']/li", doc);
            const data = [];

            // 遍历提取到的数据，将其转换为对象，并存入数组中
            for (let i = 0; i < lis.length; i++) {
                const li = lis[i]

                /*
                <li><a stid="42974" time="2023-08-26 00:00:00" itemkey="43061" itemcode="0102060301" itemname="辐射剂量率" class="showboxlink" href="#drawdialog">
                <h2>老渔窝</h2>
                <p>
                <span class="span-count">71 nGy/h</span>
                <span class="showtime">2023-08-25</span> &nbsp; </p>
                </a>

                </li>
                */
                // 使用nodeValue属性获取文本内容
                const time = xpath.select1(".//a/@time", li).nodeValue.trim();
                const itemkey = xpath.select1(".//a/@itemkey", li).nodeValue.trim();
                const itemcode = xpath.select1(".//a/@itemcode", li).nodeValue.trim();
                const itemname = xpath.select1(".//a/@itemname", li).nodeValue.trim();

                const location = xpath.select1(".//h2/text()", li).nodeValue.trim();
                const value = xpath.select1(".//p/span[@class='span-count']/text()", li).nodeValue.trim();
                const date = xpath.select1(".//p/span[@class='showtime']/text()", li).nodeValue.trim();

                // 创建一个对象，存储每一条数据
                const item = {
                    name: parentName,
                    location,
                    value,
                    date,
                    parent_id: parentId,
                    type: parentType,
                    id: null,
                    itemkey: itemkey,
                    itemcode: itemcode,
                    itemname: itemname,
                    time,
                };

                // 将对象推入数组中
                data.push(item);
            }
            // 打印转换后的数据
            // console.log(data);
            // console.log('二级分类数据完成', parentType, parentId, JSON.stringify(data));
            console.log('二级分类数据完成', parentType, parentId);

            resolve(data)
            // fs.writeFileSync('output/data.json', JSON.stringify(data, null, 4), 'utf-8');
        });
    })
    saveToDb(data)
}

function saveToDb(data) {
    if (!data || data.length == 0) {
        console.error("没有数据需要保存")
        return
    }

    // 创建一个数据库连接对象
    const connection = mysql.createConnection(mysqlConfig);

    // 连接数据库
    connection.connect((err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('数据库连接成功');

            const sql = `INSERT IGNORE INTO nuclear_data (${Object.keys(data[0]).join(', ')}) VALUES ?`;
            //          `REPLACE INTO       nuclear_data (name, location, value, date, parent_id, type, id) VALUES ?`;
            //          `INSERT IGNORE INTO nuclear_data (name, location, value, date, parent_id, type, id) VALUES ?`;

            // 将数据转换为二维数组，方便插入
            const values = data.map(item => Object.values(item));

            // let data = [
            //     {
            //       name: '红沿河核电厂',
            //       location: '复州城',
            //       value: '83 nGy/h',
            //       date: '2023-08-25',
            //       parent_id: '1',
            //       type: '1',
            //       id: '2410283902'
            //     },
            //   ];

            // const values = [
            //     [
            //         "红沿河核电厂",
            //         "复州城",
            //         "83 nGy/h",
            //         "2023-08-25",
            //         "1",
            //         "1",
            //         "2410283902"
            //     ]
            // ]

            // 执行插入或替换数据的语句，传入values作为参数
            connection.query(sql, [values], (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('成功');
                    // 关闭数据库连接
                    connection.end();
                }
            });
        }
    });
}

module.exports = {
    run: main,
}