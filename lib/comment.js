var model = require('./model');
var comment = model.comment;
var user = model.user;
var util = require('./util');

function queryComment() {
  var query = comment.select(comment.star(),
          user.name.as('creater_name'), user.icon.as('creater_icon'))
          .from(comment.join(user).on(comment.creater.equals(user.id)));
  return query;
}
exports.list = function* () {
  var id = this.params.issue;
  var query = queryComment();
  query = query.where(comment.issue.equals(id)).order(comment.createAt.descending);
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res && res.length > 0) {
    this.body = res[0];
  }
}

exports.post = function* () {
  var c = this.request.body;
  if (!c.issue || !c.content) this.throw(400);
  c.creater = this.session.user.id;
  var query = comment.insert(c).toQuery();
  var res = yield this.db.query(query.text, query.values);
  c.id = res.insertId;
  this.body = c;
}

exports.get = function* () {
  var id = this.params.id;
  var query = queryComment();
  query = query.where(comment.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res && res.length > 0 && res[0][0]) {
    this.body = res[0][0];
  }
}

exports.put = function* () {
  var c = this.request.body;
  var id = this.params.id;
  if (!c.content) this.throw(400);
  var query = comment.update({
    content: c.content,
    updateAt: new Date()
  }).where(comment.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows === 1) {
    this.body = c;
  }
}

exports.remove = function* () {
  var id = this.params.id;
  var query = comment.delete().where(comment.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows === 1) {
    this.body = {};
  }
}
