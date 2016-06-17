/*var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: 'AKIAJKEVSWPGASJ7DADQ', secretAccessKey: '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'});*/

// Use Cloudinary Service to Save Images
var cloudinary = require("cloudinary");
var config = require("../config/config.js");
var mongo = require('../database/mongo.js');
var _ = require('lodash');

// Cloudinary configurations
cloudinary.config({ 
  cloud_name: config.cloudinary.CLOUD_NAME, 
  api_key: config.cloudinary.API_KEY, 
  api_secret: config.cloudinary.API_SECRET 
});

var post = {
	getAll: function(req, res) {
		if (req.query.filterKey == 0) {
			mongo.getAllPostsByNearby({
				latitude: req.query.latitude,
				longitude: req.query.longitude
			}, function(err, data) {
				if (err) {
					res.send(JSON.stringify(err));
				}
				var postJSON = _.map(data, function(currentObject) {
				    return _.pick(currentObject, '_id', 'images', 'views', 'distance', 'ratio');
				});
				res.send(JSON.stringify(postJSON));
			});
		} else {
			mongo.getAllPostsByPopular({
				latitude: req.query.latitude,
				longitude: req.query.longitude
			}, function(err, data) {
				if (err) {
					res.send(JSON.stringify(err));
				}
				var postJSON = _.map(data, function(currentObject) {
				    return _.pick(currentObject, '_id', 'images', 'views', 'distance', 'ratio');
				});
				res.send(JSON.stringify(postJSON));
			});
		}
	},

	getById: function(req, res) {
		var postId = req.params.id;
		console.log(postId);
		
		mongo.getPostById(postId, function(err, data) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			res.send(JSON.stringify(data));
		});
	},

	create: function(req, res) {
		/*var s3 = new AWS.S3();
		
		console.log(s3);*/
		
		var files = new Array();
		var images = new Array();

		for (var i = 0; i < 7; i++) {
			var file = req.files["file"+i];
			if (file) {
			    var fileBinary = file.data.toString('base64');
			    var fileData = 'data:' + file.mimetype + ';base64,' + fileBinary;
			    files.push(fileData);
			}
			
			/*s3.putObject({
			    Bucket: 'cultish-app',
			    Key: file.name,
			    Body: file.data
			}, function(err, data) {
		        if (err)
		        	res.send(err);
		        else       
		        	console.log("Successfully uploaded image");  
		    });*/
		};
		
		for (var j = 0; j < files.length; j++) {
		    cloudinary.v2.uploader.upload(files[j], { folder: "posts/", public_id: Date.now().toString() }, function(error, result) {
		    	if (error) {
		    		res.send(false);
		    	}
		    	images.push({ image: result.url, orderId: result.public_id });
		    	if (images.length == files.length) {
		    		var imageList = _.sortBy(images, function(value) {
		    			return value.orderId.split("posts/")[1];
		    		});
		    		var imageArr = _.map(imageList, 'image');
		    		var post = JSON.parse(req.body.post);
		    		mongo.addNewPost(post, imageArr.toString(), function(err, data) {
		    			console.log(data);
		    			if (err)
		    				res.send(false);
		    			else 
		    				res.send(true);
		    		});
		    	}
		    });	
		}
	},

	update: function(req, res) {
		//@Todo: update post
	}
}

module.exports = post;