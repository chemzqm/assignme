var domify = require('domify');
var template = require('./template.html');
var List = require('list');
var Project = require('model').project;
var events = require('events');
var clear = require('clear');


function View(context) {
  var el = this.el = domify(template);
  context.parent.appendChild(el);
  this.events = events(el, this);
  var listEl = el.querySelector('.project-list');
  var tmpl = listEl.querySelector('.project');
  this.list = new List(listEl, tmpl, this);
  listEl.removeChild(tmpl);
  var self = this;
  Project.all( {
    status: 'active'
  }, function (projects) {
    self.list.bind(projects);
  })
  this.events.bind('input #filter', 'filter');
  this.events.bind('keyup #create', 'create');
}

View.prototype.remove = function () {
  this.events.unbind();
  this.list.remove();
  this.el.parentNode.removeChild(this.el);
}

View.prototype.create = function (e) {
  var list = this.list;
  if (e.keyCode == 13) {
    var v = e.target.value;
    var name = v.trim();
    if (name) {
      var project = new Project({
        name: name
      })
      project.save(function () {
        list.add(project, true);
      })
    }
  }
}


View.prototype.filter = function (e) {
  var v = e.target.value.replace(/\s+/g, '\\s*');
  var reg = new RegExp(v, 'i');
  this.list.filter(function (model) {
    return reg.test(model.name());
  })
}

View.prototype.destroy = function (e, reactive) {
  var model = reactive.model;
  model.destroy(function () {
    clear(reactive.el, function () {
      reactive.destroy();
    })
  });
}

module.exports = View;
