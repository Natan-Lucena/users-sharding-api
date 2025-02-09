import { Router } from "express";
import { ControllerFactory } from "../factories/controller-factory";

const createUserController = ControllerFactory.createUserController();

const router = Router();

router.post("/users", createUserController.execute);

export { router };
