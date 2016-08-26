var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var User = new Schema({
	name: String,
	password: String,
	email: String
});
var Blog = new Schema({
	name: String,
	title: String,
	post: String,
	time: Object
});

var conUser = mongoose.createConnection('mongodb://localhost/comtechbowuser');
var conBlog = mongoose.createConnection('mongodb://localhost/comtechbowblog');

var UserModel = conUser.model('User', User);
var BlogModel = conBlog.model('Blog', Blog);

exports.User = UserModel
exports.Blog = BlogModel
