const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersControllers");
const verifyJWT = require("../middleware/verifyJWT");

const router = require("express").Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getAllUsers)
  .post(createUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
