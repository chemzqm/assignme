var model = require('./model');
var user = model.user;
var project = model.project;
var issue = model.issue;
var util = require('./util');

//must contains
function validate(o) {
  var props = ['title', 'content','assignee', 'project'];
  for (var i = 0; i < props.length; i++) {
    if (!o.hasOwnProperty(props[i])) {
      return false;
    }
  }
  return true;
}

function queryIssue() {
  var creater = user.as('creater');
  var assignee = user.as('assignee');
  var query = issue.select(issue.star(), project.name.as('project_name'),
              creater.name.as('creater_name'), creater.icon.as('creater_icon'),
              assignee.name.as('assignee_name'), assignee.icon.as('assignee_icon'))
              .from(issue.join(project).on(issue.project.equals(project.id))
                .join(creater).on(issue.creater.equals(creater.id))
                .join(assignee).on(issue.assignee.equals(assignee.id)))
  return query;
}

exports.list = function* () {
  var query = queryIssue();
  query = util.condition(query, issue, this.query);
  query = query.order(issue.updateAt.descending)
          .limit(this.limit).offset(this.offset)
  query = query.toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res && res.length > 0) {
    this.body = res[0];
  }
}

exports.post = function* () {
  var i = this.request.body;
  if (!validate(i)) this.throw(400);
  i.creater = this.session.user.id;
  var query = issue.insert(i).toQuery();
  var res = yield this.db.query(query.text, query.values);
  i.id = res.insertId;
  this.body = i;
}

exports.get = function* () {
  var id = this.params.id;
  var query = queryIssue();
  query = query.where(issue.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res && res.length > 0 && res[0][0]) {
    this.body = res[0][0];
  }
}

exports.put = function* () {
  var i = this.request.body;
  var id = this.params.id;
  delete i.createAt;
  i.updateAt = new Date();
  var query = issue.update(i).where(issue.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows === 1) {
    this.body = i;
  }
}

exports.remove = function* () {
  var id = this.params.id;
  var query = issue.delete().where(issue.id.equals(id)).toQuery();
  var res = yield this.db.query(query.text, query.values);
  if (res.affectedRows === 1) {
    this.body = {};
  }
}
