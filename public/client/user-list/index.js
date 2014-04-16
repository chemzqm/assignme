var domify = require('domify');
var template = require('./template.html');
var List = require('list');
var User = require('model').user;
var events = require('events');

function view(context) {
  var el = this.el = domify(template);
  context.parent.appendChild(el);
  this.events = events(el, this);
  var listEl = el.querySelector('.user-list');
  var tmpl = listEl.querySelector('.user');
  this.list = new List(listEl, tmpl, this);
  listEl.removeChild(tmpl);
  var self = this;
  User.all( {
    status: 'active'
  }, function (users) {
    self.list.bind(users);
  })
  this.events.bind('input .input', 'filter');
}

view.prototype.remove = function () {
  this.events.unbind();
  this.list.remove();
  this.el.parentNode.removeChild(this.el);
}

view.prototype.filter = function (e) {
  var v = e.target.value.replace(/\s+/g, '\\s*');
  var reg = new RegExp(v, 'i');
  this.list.filter(function (model) {
    return reg.test(model.name());
  })
}

view.prototype.destroy = function (e, reactive) {
  var model = reactive.model;
  model.destroy(function () {
    reactive.destroy();
  });
}

module.exports = view;
