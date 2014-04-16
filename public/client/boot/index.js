var handle = require('handle');
var event = require('event');
var page = require('page.js');
var request = require('superagent');
var main = require('main');
var query = require('querystring');

function isAbsolute(link) {
  return /^http(s):\/\//.test(link);
}

/**
 * 绝对路径不处理
 * popup不走page
 * 其它用page定向
 */
event.bind(document.body, 'click', function (e) {
  var link = e.target;
  if (link.nodeName.toLowerCase() !== 'a') return;
  var href = link.getAttribute('href');
  if (isAbsolute(href)) return;
  if (href === '#' || link.classList.contains('popup')) return;
  e.preventDefault();
  page(link.getAttribute('href'));
})

function logout() {
  request
    .post('/logout')
    .end(handle(function () {
      window.location.href = '/';
    }))
}

var logined;

//先登录
page('*', function (ctx, next) {
  if (!logined) {
    request
      .get('/me')
      .set('Accept','application/json')
      .end(handle(function (u) {
        main(u);
        ctx.user = u;
        logined = true;
        next();
      }, true))
  } else {
    next();
  }
})

/**
 *
 * context:
 *
 *    params: url参数
 *    pathname: `/login` 不包含查询参数
 *    user: 当前用户
 *    query: 查询对象
 *    parent: 渲染的父节点
 */
function configPages(config) {
  var pageView;
  Object.keys(config).forEach(function (key) {
    var clz = config[key];
    if (typeof key === 'string') {
      page(key, function (ctx, next) {
        var context = {
          params: ctx.params,
          pathname: ctx.pathname,
          user: ctx.user,
          query: query.parse(ctx.querystring),
          parent: document.getElementById('page')
        }
        if (pageView && pageView.remove) pageView.remove();
        pageView = new clz(context);
      })
    }
  })
}

page('/logout', logout);

page('/', function (ctx, next) {
  console.log('首页');
})

//注册页面 url和class对应
configPages({
  '/users': require('user-list'),
  '/user/new': require('user-create'),
  '/user/:id': require('user-view'),
  '/user/:id/edit': require('user-edit'),
  '/projects': require('project-list'),
  '/project/:id': require('project-view'),
  '/project/:id/edit': require('project-edit'),
  '/issue/new': require('issue-create'),
  '/issue/:id': require('issue-view'),
  '/issue/:id/edit': require('issue-edit')
})

page('/users', function (ctx, next) {
  console.log('users');
})

page('*', function () {
  console.log('not found');
  page.replace('/');
})

page({
  click: false
});

