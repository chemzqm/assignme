var views = require('co-views');
var send = require('koa-send');
var fs = require('co-fs');
var user = require('./lib/user');
var project = require('./lib/project');
var issue = require('./lib/issue');
var project_user = require('./lib/project_user');
var comment = require('./lib/comment');

var cache = process.env.NODE_ENV === 'production';

module.exports = function (app) {
  //根据参数上的page和limit参数添加from和to属性, 默认20条
  function* pagenation(next) {
    var page = this.query.page || 1;
    var limit = this.query.limit || 20;
    this.limit = limit;
    this.offset = limit * (page - 1);
    yield next;
  }

  function* checkUser (next) {
    if (!this.session.user) this.throw(401);
    yield next;
  }

  function* checkAdmin (next) {
    var user = this.session.user;
    if (!user) this.throw(401);
    if (!user.admin) this.throw(403);
    yield next;
  }

  app.post('/login', user.login);
  app.get('/logout', user.logout);
  app.post('/forgetpass', user.forgetpass);
  app.post('/resetpass', user.resetpass);

  app.get('/users', checkUser, user.list);
  app.post('/user', checkAdmin, user.post);
  app.get('/user/:id', checkUser, user.get);
  app.put('/user/:id', checkAdmin, user.put);
  app.delete('/user/:id', checkAdmin, user.remove);

  app.get('/projects', checkUser, project.list);
  app.post('/project', checkAdmin, project.post);
  app.get('/project/:id', checkUser, project.get);
  app.put('/project/:id', checkAdmin, project.put);
  app.delete('/project/:id', checkAdmin, project.remove);

  app.post('/project_user', checkAdmin, project_user.post);
  app.delete('/project_user', checkAdmin, project_user.remove);
  app.get('/project_user/users/:id', checkAdmin, project_user.users);
  app.get('/project_user/projects/:id', checkUser, project_user.projects);

  app.get('/issues', checkUser, pagenation, issue.list);
  app.post('/issue', checkUser, issue.post);
  app.delete('/issue/:id', checkUser, issue.remove);
  app.put('/issue/:id', checkUser, issue.put);
  app.get('/issue/:id', checkUser, issue.get);

  app.get('/comments/:issue', checkUser, comment.list);
  app.get('/comment/:id', checkUser, comment.get);
  app.post('/comment', checkUser, comment.post);
  app.put('/comment/:id', checkUser, comment.put);
  app.delete('/comment/:id', checkAdmin, comment.remove);
}
