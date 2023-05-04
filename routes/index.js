/** ------幫routes資料夾裡建立目錄，之後若要引入資料夾內的檔案可以直接引入這個檔案------*/
module.exports = {
  auth: require("./auth"),
  course: require("./course-route"),
};
