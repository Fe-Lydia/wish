let http = require('http');

let url = require('url');

let mime = require('mime');

// //使用第三放模块来操作mysql数据库
// let mysql = require('mysql');

// //通过mysql模块提供的方法实现对MySQL数据库的操作
// //方法如下：

// //a.连接数据库
// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123456',
//     database: 'wish'
// });

// //b.执行mysql语句
// //查询 select * from lists;
// connection.query('select * from lists', (err, rows) => {
//     if (!err) {
//         //console.log(rows);

//     }
// });

// //插入 insert into (id,username,content,no,datetime)values(null,'web','哈哈哈',123123,'2017-10-28 12:00:00')
// connection.query("insert into (id,username,content,no,datetime)values(null,'web','哈哈哈',123123,'2017-10-28 12:00:00')");

// //查询用户名为itcast的用户
// //select * from lists where username = 'itcast';
// let username = 'itcast';
// let no = 123123;
// //为避免字符串的拼接，mysql模块进行封装处理
// //可以使用一个？充当一个占位符，便是此处将来会替换成一个变量
// connection.query('select * from lists where username = ? and no = ?', [username, no], (err, rows) => {
//     //console.log(rows);
// })

// connection.query('select * from lists where ?', [{ usernam: username }, { no: no }], (err, rows) => {
//     console.log(rows);
// })

//引入数据库模块
let db = require('./config/db');

let path = require('path');

let fs = require('fs');

//引入模板引擎
let template = require('art-template');
//配置模板目录
template.defaults.root = './views';
//配置模板后缀
template.defaults.extname = '.html';
//前后端避免冲突，后台花括号给成#号
template.defaults.rules[1].test = /##([@#]?)[\t]*(\/?)([\w\W]*?)[\t]*##/;

let app = http.createServer();

app.listen(3000, (err) => {
    if (!err) {
        console.log('服务求端口3000已启动！');
    }
});

app.on('request', (req, res) => {
    //设计路由
    //获得地址参数及路径
    let { pathname, query } = url.parse(req.url, true);
    //将模板引擎封装起来
    res.render = function(tpl, data) {
        //调用模板引擎
        let html = template(tpl, data);
        //设置响应头
        res.writeHeader(200, {
            'Content-Type': 'text/html;charset=utf-8'
        });
        //响应主体
        res.end(html);
    }

    switch (pathname) {
        case '/':
        case '/index':
            //使用模板引擎渲染页面
            db.query('select * from lists', (err, rows) => {
                if (!err) {
                    //rows查询结果，为数组类型
                    res.render('index', { lists: rows });
                }
            });
            break;

        case '/create':
            //随机生成序号
            query.no = Math.ceil(Math.random() * 10000);
            //设置系统时间为添加时间
            query.datetime = new Date();

            //执行sql语句
            db.query('insert into lists set ?', query, (err, info) => {
                if (!err) {
                    //相应数据为json格式
                    res.writeHeader('200', {
                            'Content-Type': 'application/json'
                        })
                        //响应结果
                    res.end(JSON.stringify({
                        code: 10000,
                        msg: '添加成功！',
                        result: query
                    }));
                }
            });
            break;

        default:
            //获得静态资源真实路径
            let realpath = path.join('./public', pathname);
            //根据真实路径读取资源
            fs.readFile(realpath, (err, data) => {
                if (!err) {
                    //设置响应头
                    res.writeHeader(200, {
                            'Content-Type': mime.getType(realpath)
                        })
                        //响应主体
                    res.end(data);
                }
            })
    }
})