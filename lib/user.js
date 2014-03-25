var crypto = require('crypto');
var Hashids = require('hashids');
var ms = require('ms');
var config = require('../config');
var hashids = new Hashids(config.salt);
var user = require('./model').user;
var util = require('./util');
var gravatar = require('gravatar');

function cryptoPassword(pass) {
  return crypto.createHash('sha1').update(pass, 'utf8').digest('hex');
}

exports.login = function* () {
  var u = this.request.body;
  if (!u.email || !u.password) this.throw(400);
  var password = cryptoPassword(u.password);
  var query = user.select(user.star()).where(user.status.equals('active'))
  query = util.condition(query, user, {
    email: u.email,
    password: password
  });
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res[0] && res[0][0]) {
    u = res[0][0];
    delete u.password;
    this.body = this.session.user = u;
  } else {
    this.throw('用户名或密码错误！', 401);
  }
}

exports.me = function* () {
  var user = this.session.user;
  if (!user) this.throw(401);
  this.body = user;
}

exports.forgetpass = function* () {
  var email = this.request.body.email;
  if(!email) this.throw(400);
  var d = (new Date()).getTime();
  var code = hashids.encrypt(d);
  yield this.db.query('update user SET code=? where email=?', [code, email]);
  var url = '/resetpass?email=' + email + '&code=' + code;
  //TODO send email
  if (this.env !== 'production') {
    this.body = { code: code };
  }
  else {
    this.body = {}
  }
}

exports.resetpass = function* () {
  var d = this.request.body;
  if (!d.code || !d.password || (d.password !== d.repassword)) this.throw(400);
  //90分钟后过期
  var time = hashids.decrypt(d.code);
  var expried = Number(time[0]) + ms('90m');
  if (isNaN(expried)) this.throw(400);
  if ((new Date()).getTime() > expried) this.throw('code expried', 400);
  var password = cryptoPassword(d.password);
  var res = yield this.db.query('update user SET password=?, code="" where code=?', [password, d.code]);
  if (res.affectedRows == 1) {
    this.body = {};
  }
}

exports.changepass = function* () {
  var d = this.request.body;
  var email = this.session.user.email;
  if (!d.password) this.throw(400);
  var password = cryptoPassword(d.password);
  var query = user.update({
    password: password
  }).where(user.email.equals(email));
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows == 1) {
    this.body = {};
  }
}

exports.list = function* () {
  var query = user.select(user.star()).from(user);
  query = util.condition(query, user, this.query);
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res && res.length > 0) {
    var arr = util.filter(res[0], ['password']);
    this.body = arr;
  }
}

exports.get = function* () {
  var id = this.params.id;
  var query = user.select(user.star()).from(user)
        .where(user.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res[0].length > 0 && res[0][0]) {
    var u = res[0][0];
    delete u.password;
    this.body = u;
  }
}

exports.post = function* () {
  var u = this.request.body;
  var admin = u.admin? '1' : '0';
  if (!u.name || !u.email || !u.password) this.throw(400);
  var password = cryptoPassword(u.password);
  if (!u.icon) {
  //默认 gravatar图片
    u.icon = gravatar.url(u.email, {s: '100', r: 'pg', d: 'retro'}, true);
  }
  var query = user.insert(u).toQuery();
  var res = yield this.db.query(query.text, query.values);
  u.id = res.insertId;
  delete u.password;
  if (res.affectedRows === 1) {
    this.body = u;
  }
}

exports.put = function* () {
  var u = this.request.body;
  var id = this.params.id;
  u.updateAt = new Date();
  var query = user.update(u).where(user.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  u.id = id;
  if (res.affectedRows === 1) {
    this.body = u;
  }
}

exports.logout = function* () {
  this.session.user = '';
  this.body = {};
}

exports.remove = function* () {
  var id = this.params.id;
  var query = user.update({
    status: 'disabled'
  }).where(user.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows === 1) {
    this.body = {};
  }
}

