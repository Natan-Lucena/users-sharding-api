import express from "express";
import { router } from "./api/container/routes";
import "dotenv/config";
import { RabbitMQPubSub } from "./api/infrastructure/services/pub-sub-impl";
import { UseCaseFactory } from "./api/container/factories/use-case-factory";
import { GrpcServer } from "./api/grpc/server";

const app = express();
app.use(express.json());
app.use(router);

const grpcServer = new GrpcServer();
grpcServer.start();

if (!process.env.RABBITMQ_URL) {
  throw new Error("Variável de ambiente RABBITMQ_URL não definida.");
}
const pubSubListener = new RabbitMQPubSub(
  process.env.RABBITMQ_URL,
  UseCaseFactory.updateUserProfilePictureUseCase()
);
pubSubListener.listen("image");

const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}! 🚀`);
});
