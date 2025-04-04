import { Router } from "express";
import { ControllerFactory } from "../factories/controller-factory";

const createUserController = ControllerFactory.createUserController();
const signInUserController = ControllerFactory.signInUserController();

const router = Router();

router.post("/users", (req, res) => createUserController.execute(req, res));
router.post("/users/sign-in", (req, res) =>
  signInUserController.execute(req, res)
);

export { router };
