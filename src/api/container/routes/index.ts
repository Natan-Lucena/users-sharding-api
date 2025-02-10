import { Router } from "express";
import { ControllerFactory } from "../factories/controller-factory";

const createUserController = ControllerFactory.createUserController();

const router = Router();

router.post("/users", (req, res) => createUserController.execute(req, res));

export { router };
