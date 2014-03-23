var model = require('./model');
var user = model.user;
var project = model.project;
var util = require('./util');

function queryProject() {
  var query = project.select(project.star(), user.name.as('creater_name'), user.icon.as('creater_icon'))
            .from(project.join(user).on(project.creater.equals(user.id)));
  return query;
}

exports.list = function* () {
  var query = queryProject();
  query = util.condition(query, project, this.query);
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res && res.length > 0) {
    this.body = res[0];
  }
}

exports.get = function* () {
  var id = this.params.id;
  var query = queryProject();
  query = query.where(project.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res && res.length > 0 && res[0][0]) {
    this.body = res[0][0];
  }
}

exports.post = function* () {
  var p = this.request.body;
  if (!p.name) this.throw(400);
  var u = this.session.user;
  p.creater = u.id;
  var query = project.insert(p).toQuery();
  var res = yield this.db.query(query.text, query.values);
  p.id = res.insertId;
  this.body = p;
}

exports.put = function* () {
  var p = this.request.body;
  var id = this.params.id;
  p.updateAt = new Date();
  var query = project.update(p).where(project.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows === 1) {
    this.body = p;
  }
}

exports.remove = function* () {
  var id = this.params.id;
  var query = project.update({
    status: 'disabled',
    updateAt: new Date()
  }).where(project.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows === 1) {
    this.body = {};
  }
}
