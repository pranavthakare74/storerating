import { Router } from "express"
import { updatePassword } from "../controllers/accountController.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()

// Any authenticated role can change their own password.
router.put("/password", authenticate, updatePassword)

export default router
