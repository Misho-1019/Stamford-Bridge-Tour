import { Router } from "express";
import ticketController from "./controllers/ticketController";
import adminController from "./controllers/adminController";

const routes = Router();

routes.use("/ticket-types", ticketController)
routes.use('/admin', adminController)

export default routes;