var domify = require('domify');
var template = require('./template.html');
var events = require('events');
var validate = require('validate-form');
var serialize = require('serialize');
var notice = require('notice');
var minstache = require('minstache');
var page = require('page.js');
var request = require('superagent');
var handle = require('handle');
var List = require('list');
var Project = require('model').project;
var User = require('model').user;
var Select = require('select');
var offset = require('offset');
var event = require('event');
var Emitter = require('emitter');
var each = require('each');
var styles = window.getComputedStyle;

function View(context) {
  var id = this.id = context.params.id;
  Project.get(id, function (project) {
    var html = minstache(template, project.attrs);
    var el = this.el = domify(html);
    this.events = events(el, this);
    context.parent.appendChild(el);
    this.events.bind('click [type="submit"]', 'post');
    this.initUsers(id);
  }.bind(this));
}

Emitter(View.prototype);

View.prototype.initUsers = function (id) {
  var tmpl = this.el.querySelector('.item');
  var parent = tmpl.parentNode;
  tmpl.parentNode.removeChild(tmpl);
  request
    .get('/project_user/users/' + id)
    .set('Accept', 'application/json')
    .query({
      status: 'active'
    })
    .end(handle(function(res) {
      this.list = new List(parent, tmpl, this);
      this.list.bind(res);
      this.initMenu();
    }.bind(this)))
}

View.prototype.search = function (users, term) {
  var res = [];
  var exists = this.list.arr.map(function(u) {
    return u.id;
  })
  users.forEach(function(u) {
    var id = u.id();
    if (exists.indexOf(id) !== -1) return;
    if (u.name().indexOf(term) !== -1
        || u.email().indexOf(term) !== -1)
    res.push(u.id() + '');
  })
  return res;
}

function addUser(select, user) {
  if (user.icon()) {
    select.add(user.id() + '', user.id(),
      '<li><img height=""src="' + user.icon() + '">' + user.name() + '</li>');
  } else {
    select.add(user.id() + '', user.id(), '<li>' + user.name() + '</li>');
  }
}

View.prototype.initMenu = function () {
  //init add user dropdown
  var ids = this.list.arr.map(function(o) {
    return o.id;
  })
  User.all({
    status: 'active'
  }, function(users) {
    var select = this.select = Select();
    select.label('添加用户');
    users.forEach(function(user) {
      var id = user.id();
      if (~ids.indexOf(id)) return;
      addUser(select, user);
    });
    this.el.querySelector('.search').appendChild(select.el);
    select.on('search', function(term, opts) {
      var ids = this.search(users, term);
      var found = 0;
      each(opts, function (id, opt) {
        if (opt.disabled) return;
        if (opt.selected) return;
        if (~ids.indexOf(id)) {
          select.show(id);
          if (1 == ++found) select.highlight(opt.el);
        } else {
          select.hide(id);
        }
      })
    }.bind(this));
    select.on('change', function (e) {
      var v = select.values();
      if (v[0]) {
        select.remove(v[0] + '');
        select.input.value = '';
        var u = find(users, v[0]);
        this.appendUser(u);
      }
    }.bind(this))
  }.bind(this));
}

function find (users, id) {
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (u.id() == id) {
      return u;
    }
  }
  return;
}

View.prototype.appendUser = function (user) {
  request
    .post('/project_user')
    .send({
      "user": user.id(),
      "project": this.id
    })
    .set('Accept', 'application/json')
    .end(handle(function(res){
      notice('添加成功', { type: 'success' });
      this.list.add(user.attrs, true);
    }.bind(this)));
}

View.prototype.post = function (e) {
  e.preventDefault();
  var form = this.el.querySelector('form');
  validate(form)
    .field('name')
      .is('required', '请输入名称')
      .is('minimum', 2,'用户名最少2个字符')
    .validate(function (err, valid, msg) {
      if (!valid) return;
      var obj = serialize(form);
      var project = new Project(obj);
      project.update(function () {
        page('/projects')
      })
    })
}

View.prototype.remove = function () {
  if (this.list) this.list.remove();
  if (this.menu) {
    this.menu.clear();
    this.menu.el.parentNode.removeChild(this.menu.el);
  }
  if (this.select) this.select.unbind();
  this.events.unbind();
  this.el.parentNode.removeChild(this.el);
}

View.prototype.destroy = function (e, reactive) {
  var model = reactive.model;
  var id = model.id;
  request
    .del('/project_user')
    .send({
      user: id,
      project: this.id
    })
    .set('Accept', 'application/json')
    .end(handle(function(res){
      notice('移除成功', { type: 'success' });
      this.list.remove('id == ' + id);
      var user = new User(model);
      addUser(this.select, user);
   }.bind(this)));
}

module.exports = View;
