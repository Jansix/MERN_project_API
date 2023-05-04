/** ------透過joi資料驗證套件來檢查會員相關資料------*/
const Joi = require("joi"); //安裝npm i joi 並引入

//註冊驗證
const registerValidation = (data) => {
  const schema = Joi.object({
    //Joi語法可參考官網
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(6).max(50).required(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().required().valid("student", "instructor"), //身分只能是學生或教師
  });

  return schema.validate(data); //會return一個布林值
};
//登入驗證
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(data);
};
//課程驗證
const courseValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(6).max(50).required(),
    description: Joi.string().min(6).max(50).required(),
    price: Joi.number().min(10).max(9999).required(),
  });
  return schema.validate(data);
};

//分別將三個驗證設定成module方便後續調用
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.courseValidation = courseValidation;
