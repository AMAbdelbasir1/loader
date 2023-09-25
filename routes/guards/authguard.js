const isAuth = (req, res, next) => {
  if (req.session.userId) {
    if (req.session.email) {
      next();
    } else {
      res.redirect("/auth/email");
    }
  } else res.redirect("/auth/login");
};
const notAuth = (req, res, next) => {
  if (!req.session.userId) next();
  else res.redirect("/videos");
};
const notEmail = (req, res, next) => {
  if (!req.session.email) next();
  else res.redirect("/profile");
};
const isAuthWitoutEmail = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else res.redirect("/auth/login");
};
module.exports = { isAuth, notAuth, notEmail, isAuthWitoutEmail };
