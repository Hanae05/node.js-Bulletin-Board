const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf-8');
const login_page = fs.readFileSync('./login.ejs', 'utf-8');
const style_css = fs.readFileSync('./style.css', 'utf-8');

const max_num = 10;
const filename = 'mydata.txt';
var message_data;
readFromFile(filename);

var server = http.createServer(getFromClient);

server.listenerCount(3000);
console.log('Server start!');

//ここまでメインプログラム＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

//createServerの処理
function getFromClient(request, response) {

    var url_parts = url.parse(request.url, true);
    switch(url_parts.pathname) {

        case '/': //トップページ（掲示板）
            response_index(request, respones);
            break;
        
        case '/login': //ログインページ
            response_login(request, response);
            break;

        case '/style.css':
            response.writeHead(200, {'Content-Type': 'text/css'});
            respone.write(style_css);
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


//indexのアクセス処理
function response_index(request, response) {
    //POSTアクセス時の処理
    if (request.method == 'POST') {
        var body = '';

        //データ受信時のイベント処理
        request.on('data', function(data) {
            data = qs.parse(body);
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

//テキストファイルダウンロード
function readFromFile(fname) {
    fs.readFile(fname, 'utf8', (err, data) => {
        message_data = data.split('\n');
    })
}

//データを更新
function addToData(id, msg, fname, request) {
    var obj = {'id': id, 'msg': msg};
    var obj_str = JSON.stringify(obj);
    console.log('add data:' + obj_str);
    message_data.unshift(obj_str);
    if (message_data.length > max_num) {
        message_data.pop();
    }
    saveToFile(fname);
}

//データを保存
function saveToFile(fname) {
    var data_str = message_data.join('\n');
    fs.writeFile(fname, data_str, (err) => {
        if (err) { throw err; }
    });
}

