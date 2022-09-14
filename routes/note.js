const {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/notesControllers");
const verifyJWT = require("../middleware/verifyJWT");

const router = require("express").Router();

router.use(verifyJWT)

router
  .route("/")
  .get(getAllNotes)
  .post(createNote)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
