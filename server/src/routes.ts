import { Router } from "express";
import ticketController from "./controllers/ticketController";
import adminController from "./controllers/adminController";
import slotController from "./controllers/slotController";
import createHold from "./controllers/holdController";
import bookingController from "./controllers/bookingController";
import blackoutRoutes from "./controllers/blackoutController";
import adminAuthController from "./controllers/adminAuthController";

const routes = Router();

routes.use("/ticket-types", ticketController)
routes.use('/admin', adminController)
routes.use('/slots', slotController)
routes.use('/holds', createHold)
routes.use('/bookings', bookingController)
routes.use('/admin/blackouts', blackoutRoutes)
routes.use('/auth/admin', adminAuthController)

export default routes;