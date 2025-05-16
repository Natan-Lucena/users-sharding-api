import * as grpc from "@grpc/grpc-js";
import { user } from "../../generated/user";
import { UserServiceImplementation } from "./services/get-user-service";

export class GrpcServer {
  private server: grpc.Server;
  private readonly port: number = 50051;

  constructor() {
    this.server = new grpc.Server();
    this.loadServices();
  }

  private loadServices() {
    this.server.addService(
      user.UnimplementedUserServiceService.definition,
      new UserServiceImplementation()
    );
  }

  public start() {
    this.server.bindAsync(
      `0.0.0.0:${this.port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error("Failed to start gRPC server:", err);
          return;
        }
        console.log(`🚀 gRPC Server is running on port ${port}`);
      }
    );
  }
}
