
/**
 * Generate condition query based on query and query obj
 */
exports.condition = function (query, scheme, obj) {
  var o = {};
  var exludes = ['type', 'page', 'limit','filter'];
  var where = /\swhere\s/i.test(query.toQuery());
  for (var p in obj) {
    if (exludes.indexOf(p) === -1) {
      if (where) {
        where = false;
        query = query.and(scheme[p].equals(obj[p]));
      } else {
        query = query.where(scheme[p].equals(obj[p]));
      }
    }
  }
  return query;
}

/*
 * remove keys from an array
 */
exports.filter = function (arr, keys) {
  var res = [];
  arr.forEach(function (o) {
    keys.forEach(function (k) {
      delete o[k];
    })
    res.push(o);
  })
  return res;
}
