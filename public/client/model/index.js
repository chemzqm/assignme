var model = require('model');
var handle = require('handle');
var array = require('array');
var query = require('querystring');
var ago = require('ago');
var notice = require('notice');

//update time
function updateAgo(model) {
  model.prototype.ago = function () {
    var t = this.updateAt();
    var d = t ? new Date(t) : Date.now();
    return ago(d);
  }
}

var User = exports.user = model('User')
  .attr('id')
  .attr('name')
  .attr('email')
  .attr('password')
  .attr('admin', { type: 'boolean' })
  .attr('icon')
  .attr('status')
  .attr('createAt', { type: 'date' })
  .attr('updateAt', { type: 'date' })
  .use(updateAgo)

var Project = exports.project = model('Project')
  .attr('id')
  .attr('name')
  .attr('creater')
  .attr('status')
  .attr('createAt', { type: 'date' })
  .attr('updateAt', { type: 'date' })
  .attr('creater_name')
  .attr('creater_icon')
  .use(updateAgo)

var Issue = exports.issue = model('Issue')
  .attr('id')
  .attr('title')
  .attr('content')
  .attr('creater')
  .attr('assignee')
  .attr('status')
  .attr('project')
  .attr('tags')
  .attr('createAt', { type: 'date' })
  .attr('updateAt', { type: 'date' })
  .use(updateAgo)

var Comment = exports.comment = model('Comment')
  .attr('id')
  .attr('issue')
  .attr('content')
  .attr('creater')
  .attr('createAt', { type: 'date' })
  .attr('updateAt', { type: 'date' })
  .use(updateAgo)

var models = [User, Project, Issue, Comment];
models.forEach(function (model) {
  model.headers({
    'Accept': 'application/json'
  })
  model.use(function (m) {
    m._base = m._base.replace(/s$/, '');
    //hack get静态方法，使用时只需传入id和回调函数第一个参数为model
    m.get = function (id, fn) {
      var self = this;
      var url = this._base + '/' + id;
      this.request
        .get(url)
        .set(this._headers)
        .end(handle(function(body){
          var model = new self(body);
          fn(model);
        }));
    }
    //hack all静态方法，可传入可选查询对象
    m.all = function (qs, fn) {
      var url = this._base + 's';
      if(!fn) {
       fn = qs;
      } else {
        var str = query.stringify(qs);
        url = url + '?' + str;
      }
      var self = this;
      this.request
        .get(url)
        .set(this._headers)
        .end(handle(function(results){
          var arr = array();
          for (var i = 0; i < results.length; i++) {
            arr.push(new self(results[i]));
          }
          fn(arr);
        }));
    }
    //hack save保存方法 成功时调用回调函数
    var _save = m.prototype.save;
    m.prototype.save = function(fn) {
      var callback = handle(function (attrs) {
        notice('添加成功', {
          type: 'success'
        });
        this.set(attrs);
        fn.apply(this, arguments);
      }.bind(this));
      _save.call(this, callback);
    }
    //hack update修改方法 成功时调用回调函数
    var _update = m.prototype.update;
    m.prototype.update = function(fn) {
      var callback = handle(function () {
        notice('更新成功', {
          type: 'success'
        });
        fn.apply(this, arguments);
      });
      _update.call(this, callback);
    }
    //hack destroy 删除方法 成功时调用回调函数
    var _destroy = m.prototype.destroy;
    m.prototype.destroy = function(fn) {
      var callback = handle(function () {
        notice('删除成功', {
          type: 'success'
        });
        fn.apply(this, arguments);
      });
      _destroy.call(this, callback);
    }
  })
})
