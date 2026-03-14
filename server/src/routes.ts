import { Router } from "express";
import ticketController from "./controllers/ticketController";
import adminController from "./controllers/adminController";
import slotController from "./controllers/slotController";
import createHold from "./controllers/holdController";

const routes = Router();

routes.use("/ticket-types", ticketController)
routes.use('/admin', adminController)
routes.use('/slots', slotController)
routes.use('/holds', createHold)

export default routes;