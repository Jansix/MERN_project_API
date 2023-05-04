/** ------本檔案定義mongoose的Schema用以創建新的【課程】到資料庫------*/
const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = new Schema({
  id: { type: String },
  title: { type: String, require: true },
  description: { type: String, require: true }, //課程
  price: { type: Number, require: true }, //價格
  instructor: {
    //講師
    type: mongoose.Schema.Types.ObjectId, //primary key(主鍵)
    ref: "User",
  },
  student: {
    //學生資料為一組陣列，預設值是空陣列
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Course", courseSchema);
