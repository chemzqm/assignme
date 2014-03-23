var model = require('./model');
var user = model.user;
var project = model.project;
var project_user = model.project_user;
var util = require('./util');

exports.post = function* () {
  var o = this.request.body;
  if (!o.user || !o.project) this.throw(400);
  var res = yield this.db.query('SELECT * from project_user WHERE user=? AND project=?', [o.user, o.project]);
  if (res[0].length > 0) this.throw('relation exists', 400);
  res = yield this.db.query('INSERT INTO project_user SET user=?, project=?', [o.user, o.project]);
  if (res.affectedRows === 1) {
    this.body = {}
  }
}

exports.remove = function* () {
  var o = this.request.body;
  if (!o.user || !o.project) this.throw(400);
  var res = yield this.db.query('DELETE from project_user WHERE user=? AND project=?', [o.user, o.project]);
  if (res.affectedRows === 1) {
    this.body = {}
  }
}

exports.users = function* () {
  var id = this.params.id;
  var query = project_user.select(user.star())
            .from(project_user.join(user).on(project_user.user.equals(user.id)))
            .where(project_user.project.equals(id));
  query = util.condition(query, user, this.query);
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  var arr = util.filter(res[0],['password']);
  this.body = res[0];
}

exports.projects = function* () {
  var id = this.params.id;
  var query = project_user.select(project.star())
            .from(project_user.join(project).on(project_user.project.equals(project.id)))
            .where(project_user.user.equals(id));
  query = util.condition(query, project, this.query);
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  this.body = res[0];
}

