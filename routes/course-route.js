/** ------設定課程相關路徑------*/
const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("course route正在接受一個req");
  next();
});

//新增課程
router.post("/", async (req, res) => {
  //驗證數據符合規範
  let error = courseValidation(req.body).error;
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  if (req.user.isStudent()) {
    return res.status(400).send("只有講師才能新增課程");
  }
  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let saveCourse = await newCourse.save();
    return res.send({ msg: "新課程已儲存", saveCourse });
  } catch (e) {
    return res.status(500).send("無法創建課程");
  }
});

//獲得系統中的所有課程
router.get("/", async (req, res) => {
  try {
    let findCourse = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    //populate是mongoDB內鍵FN，這裡是找到該講師並導出他的基本資料一同放入findCourse
    return res.send(findCourse);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;

  try {
    let findCourse = await Course.find({ title: name })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send({ findCourse });
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用課程id尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let findCourse = await Course.findOne({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send({ findCourse });
  } catch (e) {
    return res.status(500).send(e);
  }
});

//透過講師id找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  try {
    let findCourse = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send({ findCourse });
  } catch (e) {
    return res.status(500).send(e);
  }
});

//讓學生透過課程id來註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    //驗證是否已註冊過
    if (course.student.includes(req.user._id)) {
      console.log("已註冊");
      return res.send("你已註冊");
    } else {
      course.student.push(req.user._id);
      await course.save();
      console.log("註冊成功");
      return res.send("註冊完成");
    }
  } catch (e) {
    return res.send(e);
  }
});

//透過學生id找已註冊的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let findCourse = await Course.find({ student: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send({ findCourse });
});

//透過id更改課程
router.patch("/:_id", async (req, res) => {
  //驗證數據符合規範
  let error = courseValidation(req.body).error;
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let { _id } = req.params;
  //確認課程存在
  try {
    let findCourse = await Course.findOne({ _id });
    if (!findCourse) {
      return res.status(400).send("未找到課程,請重新確認ID");
    }
    //使用者必須是此課程講師
    if (findCourse.instructor.equals(req.user._id)) {
      //equals是Mongoose提供判斷兩者是否相等的函式
      let updateCourse = await Course.findByIdAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({ msg: "課程已更新", updateCourse });
    } else {
      return res.status(400).send("只有此課程講師才能編輯課程");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  //確認課程存在
  try {
    let findCourse = await Course.findOne({ _id }).exec();
    if (!findCourse) {
      return res.status(400).send("未找到課程,請重新確認ID");
    }
    //使用者必須是此課程講師
    if (findCourse.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程已被刪除");
    } else {
      return res.status(400).send("只有此課程講師才能刪除課程");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
