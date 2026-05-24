import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import providersRouter from "./providers";
import bookingsRouter from "./bookings";
import notificationsRouter from "./notifications";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(providersRouter);
router.use(bookingsRouter);
router.use(notificationsRouter);
router.use(messagesRouter);

export default router;
