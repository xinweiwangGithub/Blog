var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var mongoose = require('mongoose');
var User = require('../db').User;
var Blog = require('../db').Blog;

var Markdown = require('markdown');
var multer = require('multer');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', function(req, res){
	Blog.find({}, function(err, posts){
		if (err) {
			req.flash('error', 'home_post_error' + err);
		}
		if (!posts) {
			posts = [];
		}
		// posts.forEach(function(post){
		// 	post.post = Markdown.markdown.toHTML(post.post);
		// });
		res.render('index', {
		title: 'home',
		user: req.session.user,
		posts: posts,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
	});
});

router.get('/reg', function(req, res){
	res.render('reg', {
		title: 'register',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/reg', function(req, res){
	// get password and confirm password and check whether match
	var password = req.body.password;
	var passwordtwo = req.body.passwordtwo;
	if (password != passwordtwo) {
		req.flash('error', 'password and confirmed password not match!');
		//console.log(req.session.flash);
		return res.redirect('/reg');
	}

	// hash original password to keep privacy
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');

	//check whether user already registered
	User.findOne({name: req.body.name}, function(err, user){
		if (err) {
			req.flash('error', 'reg_check_error' + err);
			return res.redirect('/');
		}
		if (user) {
			req.flash('error', 'reg_check_duplicate: User Exists! Please choose another username!');
			return res.redirect('/reg');
		}
		// save hashed password together with outher info to db
		new User({
			name: req.body.name,
			password: password,
			email: req.body.email
		}).save(function(err, user){
			if (err) {
				req.flash('error', 'reg_error: ' + err);
				return res.redirect('/');
			}
			req.session.user = user;
			req.flash('success', 'reg_success: Register Successfully!');
			res.redirect('/');
		});
	});
});

router.get('/login', function(req, res){
	res.render('login', {
		title: 'login',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/login', function(req, res){
	// hash original password to keep privacy
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');

	User.findOne({name: req.body.name}, function(err, user){
		if (err) {
			req.flash('error', 'login_findUser_error: ' + err);
			return res.redirect('/');
		}
		if (!user) {
			req.flash('error', 'username or password not correct!');
			return res.redirect('/login');
		}
		// save hashed password together with outher info to db
		if (password != user.password) {
			req.flash('error', 'username or password not correct!');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', 'login successfully!');
		res.redirect('/');
	});
});

router.get('/post', function(req, res){
	res.render('post', {
		title: 'post',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/post', function(req, res){
	// save hashed password together with outher info to db
	
	new Blog({
		name: req.session.user.name,
		title: req.body.title,
		post: req.body.post,
		time: getTimeObject()
	}).save(function(err, blog){
		if (err) {
			req.flash('error', 'post_error: ' + err);
			return res.redirect('/');
		}
		req.flash('success', 'post_success: post Successfully!');
		res.redirect('/');
	});
	//console.log(getTimeObject());
});

router.get('/logout', function(req, res){
	req.session.user = null;
	req.flash('success', 'logout successfully!');
	res.redirect('/');
});


router.get('/upload', function(req, res){
	res.render('upload', {
		title: 'upload',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './public/images')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});

var upload = multer({
    storage: storage
});

router.post('/upload', upload.array('field', 5) ,function(req, res){
	req.flash('success', 'upload_success: upload Successfully!');
	res.redirect('/upload');
});

var getTimeObject = function () {
	var date = new Date();
	var timeObj = {
		date: date,
      	year : date.getFullYear(),
     	month : date.getFullYear() + "-" + (date.getMonth() + 1),
      	day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      	minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      	date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	return timeObj;
};

module.exports = router;
