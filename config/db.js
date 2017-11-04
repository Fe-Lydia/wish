//引入数据库
let mysql = require('mysql');
//公开数据
module.exports = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'wish'
});