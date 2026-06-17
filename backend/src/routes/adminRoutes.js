import { Router } from "express"
import {
  getDashboard,
  createUser,
  listUsers,
  getUser,
  createStore,
  listStores,
  listOwners,
} from "../controllers/adminController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = Router()

// Every route here requires an authenticated ADMIN.
router.use(authenticate, authorize("ADMIN"))

router.get("/dashboard", getDashboard)

router.get("/users", listUsers)
router.post("/users", createUser)
router.get("/users/:id", getUser)

router.get("/stores", listStores)
router.post("/stores", createStore)

router.get("/owners", listOwners)

export default router
