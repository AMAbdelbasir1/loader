const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_HOST}/auth/facebook/callback`,
      profileFields: ["id", "displayName", "picture.type(large)", "emails"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_HOST}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      profile.photos[0].value = profile.photos[0].value.replace(
        "s96-c",
        "s400-c",
      );
      done(null, profile);
    },
  ),
);

// Configure Passport session serialization and deserialization
// Serialize the user's profile information
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize the user's profile information
passport.deserializeUser((user, done) => {
  done(null, user);
});
