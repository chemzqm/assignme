var koa = require('koa');
var _ = require('koa-one');
var filter = require('koa-json-filter');
var liveload = require('koa-liveload');
var route = require('./route');
var port = process.env.PORT;
var mysql = require('mysql-co');
var config = require('./config');
var redisStore = require('koa-redis');
var ms = require('ms');
var env = process.env.NODE_ENV || 'development';
var app = koa();
var error = require('koa-error')

app.proxy = true;
app.outputErrors = true;
app.name = config.name;
app.keys = config.keys;

if (env !== 'test') {
  app.use(_.logger());
}
app.use(_.favicon());
app.use(error());
app.use(_.compress());
app.use(_.responseTime());
app.use(_.body());
app.use(_.conditionalGet());
app.use(_.etag());
app.use(_.sess({
  key: 'assign.pid',
  cookie: {path: '/', httpOnly: true, maxAge: ms('30d')},
  store: redisStore(config.redis)
}))
app.use(liveload(__dirname, {
  excludes: ['lib', 'client', 'components']
}))
app.use(filter());
//this.env
app.use(function* (next) {
  this.env = env;
  yield next;
})
//html5支持，如果请求接受html并且不强制类型为json则输出首页
app.use(function* (next) {
  var type = this.query.type;
  if ( !/\.html$/.test(this.path)
      && /text\/html/.test(this.request.get('accept'))
      && type != 'json') {
    this.path = '/';
  }
  yield next;
})
//对于json请求启用mysql支持
app.use(function* (next) {
  if (this.accepts('json')) {
    var err;
    try {
      this.db = mysql.createConnection(config.mysql);
      yield next;
    } catch(e) {
      err = e;
    } finally {
      this.db.end();
      if (err) {
        err.status = err.status || 500;
        throw err;
      }
    }
  } else {
    yield next;
  }
})
app.use(_.router(app));
app.use(_.serve(__dirname + '/public', {
  defer: true
}));
route(app);

app.listen(port, function () {
  console.log('server started at port ' + port);
})

