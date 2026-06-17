import { Router } from "express"
import { getDashboard } from "../controllers/ownerController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = Router()

router.use(authenticate, authorize("OWNER"))

router.get("/dashboard", getDashboard)

export default router
