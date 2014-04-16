
var sql = require('sql').create('mysql');


/**
 * SQL definition for assignme.comment
 */
exports.comment = sql.define({
	name: 'comment',
	columns: [
		{ name: 'id' },
		{ name: 'issue' },
		{ name: 'content' },
		{ name: 'creater' },
		{ name: 'createAt' },
		{ name: 'updateAt' }
	]
});


/**
 * SQL definition for assignme.issue
 */
exports.issue = sql.define({
	name: 'issue',
	columns: [
		{ name: 'id' },
		{ name: 'title' },
		{ name: 'content' },
		{ name: 'creater' },
		{ name: 'assignee' },
		{ name: 'status' },
		{ name: 'project' },
		{ name: 'createAt' },
		{ name: 'tags' },
		{ name: 'updateAt' }
	]
});


/**
 * SQL definition for assignme.project
 */
exports.project = sql.define({
	name: 'project',
	columns: [
		{ name: 'id' },
		{ name: 'name' },
		{ name: 'creater' },
		{ name: 'createAt' },
		{ name: 'updateAt' },
		{ name: 'status' }
	]
});


/**
 * SQL definition for assignme.user
 */
exports.user = sql.define({
	name: 'user',
	columns: [
		{ name: 'id' },
		{ name: 'name' },
		{ name: 'email' },
		{ name: 'createAt' },
		{ name: 'updateAt' },
		{ name: 'admin' },
		{ name: 'password' },
		{ name: 'status' },
		{ name: 'icon' },
		{ name: 'code' }
	]
});


/**
 * SQL definition for assignme.user_project
 */
exports.project_user = sql.define({
	name: 'project_user',
	columns: [
		{ name: 'user' },
		{ name: 'project' }
	]
});


