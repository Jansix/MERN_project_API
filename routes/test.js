const router = require("express").Router();

router.get("/", async (req, res) => {
  console.log("這是測試頁");
  res.send("這是測試頁");
});

module.exports = router;
