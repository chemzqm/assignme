var domify = require('domify');
var minstache = require('minstache');
var template = require('./template.html');
var dialog = require('dialog');
var event = require('event');
var validate = require('validate-form');
var serialize = require('serialize');
var request = require('superagent');
var handle = require('handle');
var dialog_template = require('./changepass.html');


function changepass(e) {
  e.preventDefault();
  var el = domify(dialog_template);
  var pop = dialog('重置密码', el)
    .modal()
    .closable()
    .show();
  var btn = el.querySelector('[type="submit"]');
  var form = el.querySelector('form');
  event.bind(btn, 'click', function (e) {
    e.preventDefault();
    validate(form)
      .field('password')
        .is('required', '请输入密码')
        .is('minimum', 6,'密码最少6个字符')
      .field('repassword')
        .is('required', '请输入确认密码')
        .is('equal', 'password', '情输入相同密码')
        .is('minimum', 6, '密码最少6个字符')
      .validate(function (err, valid, msg) {
        if (!valid) return;
        var obj = serialize(form);
        request.post(form.action)
          .set('Accept', 'application/json')
          .send(obj)
          .end(handle(function () {
            pop.hide();
          }))
      })
  })
}

module.exports = function (user) {
  var html = minstache(template, user);
  var el = domify(html);
  document.body.appendChild(el);
  var a = document.getElementById('changepass');
  event.bind(a, 'click', changepass);
  return el;
}
