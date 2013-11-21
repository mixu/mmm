var Backbone = require('backbone'),
    mg = require('mg');

var Post = Backbone.Model.extend({
  sync: mg.sync('Post'),
  type: 'Post',
  urlRoot: 'http://localhost:8721/posts',
  plural: 'posts',
  collection: 'Posts',
  idAttribute: '__id',
  rels: {
    'author': {
      type: 'Person'
    },
    'comments': {
      type: 'Comment'
    }
  }
});

mg.define('Post', Post);

var Posts = Backbone.Collection.extend({
  url: 'http://localhost:8721/posts',
  // additional property
  special: true
});

mg.define('Posts', Posts);

var Person = Backbone.Model.extend({
  sync: mg.sync('Person'),
  urlRoot: 'http://localhost:8721/people',
  plural: 'people'
});

mg.define('Person', Person);

var Comment = Backbone.Model.extend({
  sync: mg.sync('Comment'),
  urlRoot: 'http://localhost:8721/comments',
  plural: 'comments'
});

mg.define('Comment', Comment);

module.exports = {
  Post: Post,
  Posts: Posts,
  Person: Person,
  Comment: Comment
};
