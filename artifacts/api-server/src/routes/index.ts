import { Router, type IRouter } from "express";
import healthRouter from "./health";
import credentialsRouter from "./credentials";

const router: IRouter = Router();

router.use(healthRouter);
router.use(credentialsRouter);

export default router;
