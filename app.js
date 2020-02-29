//デバッグ
const log4js = require('log4js')
const logger = log4js.getLogger();
logger.level = 'debug';

logger.debug('Hello world!');


//スタート
const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf-8');
const login_page = fs.readFileSync('./login.ejs', 'utf-8');
const style_css = fs.readFileSync('./style.css', 'utf-8');

//画面に表示される最大個数
const max_num = 10;

//送信されたデータが入る
const filename = 'mydata.txt';

//filenameの中身 グローバル関数にするためにここで指定している
var message_data;
readFromFile(filename);

var server = http.createServer(getFromClient);

server.listen(3000);
console.log('Server start!');

//ここまでメインプログラム＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

//createServerの処理
function getFromClient(request, response) {

    var url_parts = url.parse(request.url, true);
    switch(url_parts.pathname) {

        case '/': //トップページ（掲示板）
            response_index(request, response);
            break;
        
        case '/login': //ログインページ
            response_login(request, response);
            break;

        case '/style.css':
            response.writeHead(200, {'Content-Type': 'text/css'});
            response.write(style_css);
            response.end();
            break;

        default:
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end();
            break;
    }
}

//loginのアクセス処理
function response_login(request, response) {
    var content = ejs.render(login_page, {});
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
    response.end();
}

logger.debug('Hello world!2');

//indexのアクセス処理
function response_index(request, response) {
    //POSTアクセス時の処理
    if (request.method == 'POST') {
        var body = '';

        //データ受信時のイベント処理
        request.on('data', function(data) {
            body +=data;
        });

        request.on('end', function() {
            //console.log(body);
            data = qs.parse(body);
            //console.log(data);
            addToData(data.id, data.msg, filename, request);
            write_index(request, response);
        });
    } else {
        write_index(request, response);
    }
}

//indexのページ作成
function write_index(request, response) {
    var msg = "※何かメッセージを書いて下さい。";
    var content = ejs.render(index_page, {
        title:'Index',
        content:msg,
        data:message_data,
        filename:'data_item',
    });
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
    response.end();
}

logger.debug('Hello world!3');

//テキストファイルダウンロード
function readFromFile(fname) {
    fs.readFile(fname, 'utf8', (err, data) => {
        console.log(data);
        message_data = data.split('\n');
        console.log(message_data);
    })
}

//データを更新
function addToData(id, msg, fname, request) {
    var obj = {'id': id, 'msg': msg};
    var obj_str = JSON.stringify(obj);
    console.log('add data:' + obj_str);
    message_data.unshift(obj_str);
    console.log(message_data); 
    if (message_data.length > max_num) {
        message_data.pop();
    }
    saveToFile(fname);
}

//データを保存
function saveToFile(fname) {
    var data_str = message_data.join('\n');
    console.log(data_str);
    fs.writeFile(fname, data_str, (err) => {
        if (err) { throw err; }
    });
}

