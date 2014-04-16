var notice = require('notice');
var dialog = require('dialog');
var domify = require('domify');
var template = require('./login.html');
var event = require('event');
var request = require('superagent');
var validate = require('validate-form');
var serialize = require('serialize');
var page = require('page.js');

function error() {
  var arr = [].slice.call(arguments);
  var msg = arr.join(' ');
  notice(msg, { type: 'error' });
}

var el = domify(template);
var login_dialog = dialog('登录', el).modal();
var btn = el.querySelector('[type="submit"]');
var form = el.querySelector('form');

event.bind(btn, 'click', function (e) {
  e.preventDefault();
  validate(form)
    .field('email')
      .is('required', '请输入邮箱')
      .is('email', '邮箱格式不正确')
    .field('password')
      .is('required', '请输入密码')
      .is('minimum', 6, '密码最少6个字符')
    .validate(function (err, valid, msg) {
      if (!valid) return;
      var obj = serialize(form);
      request.post('/login')
        .set('Accept', 'application/json')
        .send(obj)
        .end(handle(function (user) {
          login_dialog.hide();
          page('/');
        }))
    })
})


/**
 * 
 * @param {String} fn 回调函数,可选，只有成功时调用
 * @param {String} silent 是否自动隐藏提示层
 * @api public
 */
var handle = module.exports = function (fn) {
  var n = notice('等待响应...');
  return function (err, res) {
    n.clear();
    if (res.error) {
      switch(res.status) {
        case 404:
          error('404 未找到对应资源');
          break;
        case 403:
          error('403 禁止访问');
          break;
        case 401:
          notice('请重新登录').hide(4000);
          login_dialog.show();
          break;
        case 400:
          error('400 错误请求');
          break;
        default:
          if (res.body && res.body.error) {
            error(res.body.error);
          } else {
            error('服务器错误：', res.error.message);
          }
      }
    } else {
      if (res.ok) {
        if (fn) fn(res.body);
      } else {
        console.log(err);
        error('未知错误');
      }
    }
  }
}
