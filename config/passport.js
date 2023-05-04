/** ------設定一個Jwt驗證的函式------*/
let JwtStrategy = require("passport-jwt").Strategy; //引入Passport中jwt類型驗證策略的模組
let ExtractJwt = require("passport-jwt").ExtractJwt; //可以把JWT的token拉出來
const User = require("../models").user;

module.exports = (passport) => {
  let opts = {}; //passport-jwt語法
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET;

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        let findUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (findUser) {
          return done(null, findUser);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};
