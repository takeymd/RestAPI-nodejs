var auth = require("./auth.js");
var post = require("./post.js");

var router = function(app) {
  app.get("/", function(req, res) {
  	res.send("Welcome! This is Cultish API.");
  });

  // Social sign in routes
  app.get("/facebooksignin", auth.facebook);
  app.get("/googlesignin", auth.google);

  // routes for read posts, create new post or update post
  app.get("/posts", post.getAll);
  app.get("/posts/:id", post.getById);
  app.post("/createPost", post.create);
  app.put("/updatePost", post.update);
}

module.exports = router;