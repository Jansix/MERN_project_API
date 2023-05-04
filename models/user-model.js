/** ------本檔案定義mongoose的Schema用以創建新的【使用者】到資料庫------*/
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt"); //雜湊套件

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    //身分欄位，只能是老師或學生
    type: String,
    enum: ["student", "instructor"],
    required: true,
  },
  data: {
    //時間類型，預設為當下
    type: Date,
    default: Date.now,
  },
});
/** ------instance methods(創建實例方法)------*/
userSchema.methods.isStudent = function () {
  //把方法創建在userSchema.method下
  return this.role == "student"; //role可自訂義
};

userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

//自訂comparePassword方法透過bcrypt內建compare比較用戶密碼與資料庫是否匹配
userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
    // bcrypt.compare可用來確認已加密的密碼和明文密碼是否相符
  } catch (e) {
    return cb(e, result);
  }
};

/** ------mongoose middlewares------*/
//若是新用戶，或正在更改密碼則將密碼進行雜湊
userSchema.pre("save", async function (next) {
  //pre語法保存前執行後面的FN
  //this代表 mongoDB內的document
  if (this.isNew || this.isMOdified("password")) {
    //.isNew判斷是否新建，.isMOdified判斷是否被修改過
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

// 在 Node.js 中導出 Mongoose 模型，命名為 "User"，使用 "userSchema" 進行創建
module.exports = mongoose.model("User", userSchema);
