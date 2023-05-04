/** ------製作一個處理routes的中介軟體，只要有關/auth的都由此routes處理------*/
const router = require("express").Router();
//下面兩行是引入validation檔案內透過Joi的API建立的驗證機制
const registerValidation = require("../validation").registerValidation; //註冊驗證
const loginValidation = require("../validation").loginValidation; //登入驗證
const User = require("../models").user; //引入先前製作的註冊modules
const jwt = require("jsonwebtoken"); //引入套件  npm i jsonwebtoken

//中介軟體設置
router.use((req, res, next) => {
  console.log("正在接收一個跟auth有關的請求");

  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("成功連結auth route......");
});

//設定register路徑讓用戶註冊，
//註冊後的資料會存在body接著用registerValidation去驗證req.body的資料
router.post("/register", async (req, res) => {
  let error = registerValidation(req.body).error; //body內的錯誤指定給error變數
  if (error) {
    //若驗證結果error為真就回傳400並顯示錯誤訊息內details物件第零項的message訊息
    return res.status(400).send(error.details[0].message);
  } //確認信項是否註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此信箱已被註冊過了。。");

  //製作新用戶
  let { email, username, password, role } = req.body; //拿到用戶儲存於body的資料
  let newUser = new User({ email, username, password, role }); //用User創建
  try {
    let savedUser = await newUser.save(); //儲存使用者
    return res.send({
      msg: "成功創建帳號",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("無法儲存使用者");
  }
});

router.post("/login", async (req, res) => {
  let error = loginValidation(req.body).error;
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  //確認信項是否註冊過
  const findUser = await User.findOne({ email: req.body.email });
  if (!findUser) {
    return res.status(400).send("無法找到使用者，請確認信箱。。");
  }
  findUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      //製作json web token
      const tokenObject = { _id: findUser._id, email: findUser.email };
      //使用jsonwebtoken套件的sign函式參數為 資料跟祕密
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        msg: "成功登入",
        token: "JWT " + token,
        user: findUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;
