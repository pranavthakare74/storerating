import { Router } from "express"
import { listStores, submitRating } from "../controllers/userController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = Router()

router.use(authenticate, authorize("USER"))

router.get("/stores", listStores)
router.post("/stores/:storeId/rating", submitRating)

export default router
