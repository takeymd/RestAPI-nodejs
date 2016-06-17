var mongo = require('mongoskin');
var ObjectId  = mongo.ObjectId;
var config = require("../config/config.js");

//var db = mongo.db(process.env.MONGOLAB_URI || config.mLab, {native_parser:true});
var db = mongo.db('mongodb://localhost:27017/cultish', {native_parser:true});
db.bind('users');
db.bind('posts');

// check if email already exists as other social account
exports.checkExistOtherSocial = function(email, isGoogle, callback) {
 if (email == '') {
  callback({ success: false, message: 'email required'});
 } else {
  db.users.findOne({ email: email, isGoogle: !isGoogle }, function(err, res) {
   if (err) {
    callback(err);
   }
   if (res) {
    callback({ isExist: true });
   } else {
    callback({ isExist: false });
   }
  });
 }
};

// add user
exports.addUser = function(userInfo, callback) {
	if (userInfo.email == "" || userInfo.name == "") {
		callback({ success: false, message: 'required fields'});
	} else {
		db.users.findOne({email: userInfo.email}, function(err, res) {
			if (err) {
				console.log(err);
				callback(err, null);
			}
			if (res) {
				console.log('you are already a user! :', res);
				callback(null, res);
			} else {
				console.log('you are about to register to cultish!')
				db.users.insert({
					email: userInfo.email,
					name: userInfo.name,
					givenName: userInfo.givenName,
		            familyName: userInfo.familyName,
		            pictureUrl: userInfo.pictureUrl,
		            isGoogle: userInfo.isGoogle,
		            createAt: Date.now(),
		            updateAt: Date.now()
				}, function(err, res) {
					if (err) {
						console.log(err);
						callback(err, null)
					}
					callback(null, res.ops[0]);
				});
			}
		});
	}
};

// add new post
exports.addNewPost = function(postInfo, images, callback) {
	if (!postInfo._userId) {
		console.log('no user id!');
		callback({ success: false, message: 'required fields'});
	} else {
		db.posts.insert({
			userId: postInfo._userId,
			brand: postInfo._brand,
			model: postInfo._model,
            description: postInfo._description,
            price: postInfo._price,
            currency: postInfo._currency,
            location: {
			    type: "Point",
			    coordinates: [ postInfo._longitude, postInfo._latitude ]
		    },
            views: 0,
            images: images,
            createAt: Date.now(),
            updateAt: Date.now()
		}, function(err, res) {
			if (err) {
				console.log(err);
				callback(err, null)
			}
			console.log('successfully saved!');
			callback(null, res.ops[0]);
		});
	}
}

// get all posts by keyword
exports.getAllPostsByNearby = function(geoInfo, callback) {
	
	if (!geoInfo.latitude || !geoInfo.longitude) {
		console.log('no geolocation info!');
		callback({ success: false, message: 'required geo info'});
	} else {
		db.posts.createIndex({location:"2dsphere"});
		db.posts.aggregate([
		   {
		     $geoNear: {
		        near: { type: "Point", coordinates: [ parseFloat(geoInfo.longitude) , parseFloat(geoInfo.latitude) ] },
		        distanceField: "distance",
		        spherical: true
		     }
		   },
		   { $sort: { distance: 1 } },
		   { $limit: 20 }
		], function(err, docs) {
			if (err) {
				callback(err, null);
			}
			callback(null, docs);
		});
	}
}

exports.getAllPostsByPopular = function(geoInfo, callback) {
	if (!geoInfo.latitude || !geoInfo.longitude) {
		console.log('no geolocation info!');
		callback({ success: false, message: 'required geo info'});
	} else {
		db.posts.createIndex({location:"2dsphere"});
		db.posts.aggregate([
		   {
		     $geoNear: {
		        near: { type: "Point", coordinates: [ parseFloat(geoInfo.longitude) , parseFloat(geoInfo.latitude) ] },
		        distanceField: "distance",
		        spherical: true
		     }
		   },
		   { $sort: { views: -1 } },
		   { $limit: 20 }
		], function(err, docs) {
			if (err) {
				callback(err, null);
			}
			callback(null, docs);
		});
	}
}

// get post by post id
exports.getPostById = function(postId, callback) {
	if (postId == "") {
		callback({ success: false, message: 'required post ID'});
	} else {
		db.posts.findOne({ _id: ObjectId(postId)}, function(err, res) {
			if (err) {
				console.log(err);
				callback(err, null);
			}
			if (res) {
				console.log('success! :', res);
				
				if (res.userId) {
					db.users.findOne({ _id: ObjectId(res.userId)}, function(error, result) {
					    if (error) {
					    	callback(err, null);
					    }
					    if (result) {
					    	res.userInfo =  result;
					    	callback(null, res);
					    } else {
					    	callback(null, null);
					    }
					});
				}
			} else {
				callback(null, null);
			}
		});
	}
};

