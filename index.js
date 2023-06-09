const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes/").auth; //引入routes資料夾內的auth檔案，資料夾若未指定檔案則會預設在目錄位置
const courseRoute = require("./routes").course;
const testRoute = require("./routes").test;
const passport = require("passport"); //引入npm的passport套件
require("./config/passport")(passport); //引入自建資料夾內的檔案執行唯一的函式並將passport當作參數
const cors = require("cors");
const PORT = process.env.PORT || 8080;

app.use(cors());

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("已連結到MongoDB。。");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//將auth這個middleware 註冊到/api/user這個路徑，所有經過這路由都須先經過auth的FN
app.use("/api/user", authRoute);

/**只有登入系統的人才能新增課程或是註冊課程
 * 將course路徑註冊到courseRoute，並經過passport內鍵用以驗證jwt的中間件*/
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }), //參數分別為驗證方式及驗證行為
  courseRoute
);

app.use("/test", testRoute);

app.listen(PORT, () => {
  console.log("後端伺服器在port8080聆聽。。");
});
