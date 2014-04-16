var domify = require('domify');
var template = require('./template.html');
var events = require('events');
var Switch = require('switch');
var User = require('model').user;
var validate = require('validate-form');
var serialize = require('serialize');
var Upload = require('upload');
var notice = require('notice');
var page = require('page.js');

function View(context) {
  var el = this.el = domify(template);
  this.events = events(el, this);
  context.parent.appendChild(el);
  var sw = new Switch();
  sw.takeover(el.querySelector('[name="admin"]'));
  this.events.bind('click [type="submit"]', 'post');
  this.events.bind('change [type="file"]', 'upload');
}

View.prototype.post = function (e) {
  e.preventDefault();
  var form = this.el.querySelector('form');
  validate(form)
    .field('name')
      .is('required', '请输入用户名')
      .is('minimum', 2,'用户名最少2个字符')
    .field('email')
      .is('required', '请输入邮箱')
      .is('email', '邮箱格式不正确')
    .field('password')
      .is('required', '请输入密码')
      .is('minimum', 6,'密码最少6个字符')
    .validate(function (err, valid, msg) {
      if (!valid) return;
      var obj = serialize(form);
      var user = new User(obj);
      user.save(function () {
        page('/users');
      })
    })
}

View.prototype.upload = function (e) {
  var file = e.target.files[0];
  if (!file) return;
  var upload = new Upload(file);
  upload.to('/upload');
  upload.on('progress', function () {
  });
  upload.on('end', function (res) {
    var files = JSON.parse(res.responseText);
    if (res.status == '200' && files[0]) {
      var file = files[0];
      this.el.querySelector('[name="icon"]').value = file;
      var img = domify('<img src="' + file + '">');
      var icon = this.el.querySelector('.icon');
      icon.innerHTML = '';
      icon.appendChild(img);
    } else {
      notice('图片上传失败，错误代码：' + res.status, {
        type: 'error'
      })
    }
  }.bind(this));
}

View.prototype.remove = function () {
  this.el.parentNode.removeChild(this.el);
  this.events.unbind();
}

module.exports = View;
