var assert = require('assert'),
    mg = require('mg'),
    http = require('http');

var server = require('./lib/test_server.js'),
    request = require('./lib/request.js')
              .defaults({
                hostname: 'localhost',
                port: 8000
               });

exports['reading items'] = {

  before: function(done) {
    this.server = http.createServer(function(req, res) {
      server.onRequest(req, res);
    }).listen(8000).on('listening', done);
  },

  after: function(done) {
    this.server.once('close', done).close();
  },

  'can read /item/:id': function(done) {
    request({
      path: '/people/1000',
      method: 'GET'
    }, function(err, data) {
      // console.log(data);
      // expect { people: [ { .. model .. } ] }
      assert.ok(data.people);
      assert.ok(Array.isArray(data.people));
      assert.ok(data.people.length, 1);
      assert.equal(data.people[0].id, 1000);
      done();
    });
  },

  'can read /item?ids=:id1,:id2': function(done) {
    request({
      path: '/comments?ids=1,2',
      method: 'GET'
    }, function(err, data) {
      // console.log(data);
      // expect { comments: [ { .. model .. } ] }
      assert.ok(data.comments);
      assert.ok(Array.isArray(data.comments));
      assert.ok(data.comments.length, 2);
      assert.equal(data.comments[0].id, 1);
      assert.equal(data.comments[1].id, 2);
      done();
    });
  },

  'can read /item/:id1,:id2': function(done) {
    request({
      path: '/comments/1,2',
      method: 'GET'
    }, function(err, data) {
      // console.log(data);
      // expect { comments: [ { .. model .. } ] }
      assert.ok(data.comments);
      assert.ok(Array.isArray(data.comments));
      assert.ok(data.comments.length, 2);
      assert.equal(data.comments[0].id, 1);
      assert.equal(data.comments[1].id, 2);
      done();
    });
  }
};

exports['creating, updating, deleting'] = {

  before: function(done) {
    this.server = http.createServer(function(req, res) {
      server.onRequest(req, res);
    }).listen(8000).on('listening', done);
  },

  after: function(done) {
    this.server.once('close', done).close();
  },

  'can create a new item via POST /comments': function(done) {
    request({
      path: '/comments',
      method: 'POST',
      data: JSON.stringify({ name: 'new comment' })
    }, function(err, data, res) {
      // console.log(data);

      // MUST respond with a 201 Created
      assert.equal(res.statusCode, 201);
      // MUST include a Location
      assert.ok(res.headers.location);

      assert.ok(data.comments);
      assert.ok(Array.isArray(data.comments));
      assert.ok(data.comments.length, 1);
      assert.equal(data.comments[0].name, 'new comment');
      done();
    });
  },

  'can update a item via PATCH+replace /comments': function(done) {
    request({
      path: '/comments/3',
      method: 'PATCH',
      data: JSON.stringify([
        { op: 'replace', path: '/name', value: 'updated comment' }
      ])
    }, function(err, data, res) {
      // Respond 204 No content if the update was successful
      assert.equal(res.statusCode, 204);
      assert.equal(data, '');
      done();
    });
  },

  'can associate a item via PATCH+add /posts': function(done) {
    request({
      path: '/posts/2',
      method: 'PATCH',
      data: JSON.stringify([
        { op: 'add', path: '/links/comments/-', value: 3 }
      ])
    }, function(err, data, res) {
      // Respond 204 No content if the update was successful
      assert.equal(res.statusCode, 204);
      assert.equal(data, '');
      done();
    });
  },

  'can remove an association via PATCH+remove /posts': function(done) {
    request({
      path: '/posts/2',
      method: 'PATCH',
      data: JSON.stringify([
        { op: 'remove', path: '/links/comments/3' }
      ])
    }, function(err, data, res) {
      // Respond 204 No content if the update was successful
      assert.equal(res.statusCode, 204);
      assert.equal(data, '');
      done();
    });

  },

  'can delete a item via DELETE /posts/id': function(done) {
    request({
      path: '/posts/1',
      method: 'DELETE'
    }, function(err, data, res) {
      // Respond 204 No content
      assert.equal(res.statusCode, 204);
      assert.equal(data, '');
      done();
    });
  }
};



// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha',
    [ '--colors', '--bail', '--ui', 'exports', '--reporter', 'spec', __filename ]
  );
  mocha.stderr.on('data', function (data) {
    if (/^execvp\(\)/.test(data)) {
     console.log('Failed to start child process. You need mocha: `npm install -g mocha`');
    }
  });
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
