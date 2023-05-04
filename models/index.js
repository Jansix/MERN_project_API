/** ------幫models資料夾裡的models建立目錄，之後若要引入models可以直接引入這個檔案------*/
module.exports = {
  user: require("./user-model"),
  course: require("./course-model"),
};
