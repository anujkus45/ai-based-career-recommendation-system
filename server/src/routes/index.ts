import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import careerRouter from "./career/index";
import skillGapRouter from "./skill-gap/index";
import assessmentsRouter from "./assessments/index";
import streamRouter from "./stream/index";
import compareRouter from "./compare/index";
import costRouter from "./cost/index";
import profileRouter from "./profile/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(careerRouter);
router.use("/skill-gap", skillGapRouter);
router.use(assessmentsRouter);
router.use(streamRouter);
router.use(compareRouter);
router.use(costRouter);
router.use(profileRouter);

export default router;
