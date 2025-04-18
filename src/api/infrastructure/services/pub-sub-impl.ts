import amqp from "amqplib";
import { Logger } from "../../shared/core/logger";
import { PubSub } from "../../application/services/pub-sub";
import { UpdateUserProfilePictureUseCase } from "../../application/use-cases/update-user-profile-picture/update-user-profile-picture";
import { Uuid } from "../../shared/core/uuid";

export class RabbitMQPubSub implements PubSub {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;

  constructor(
    private readonly rabbitMQUrl: string,
    private readonly updateUserProfilePictureUseCase: UpdateUserProfilePictureUseCase
  ) {}

  private async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await amqp.connect(this.rabbitMQUrl);
      this.channel = await this.connection.createChannel();
      Logger.info("🟢 RabbitMQ Connected");
      console.log("🟢 RabbitMQ Connected");
    }
  }

  async listen(channel: string): Promise<void> {
    await this.connect();

    await this.channel.assertQueue(channel);
    await this.channel.bindQueue(channel, channel, "");
    await this.channel.consume(channel, (message) => {
      if (!message) return;

      switch (channel) {
        case "image": {
          const messageContent = message.content.toString();
          Logger.info(`📩  Message received from channel: "${channel}"`);
          console.log(
            `📩 Message received from channel"${channel}": ${messageContent}`
          );

          this.channel.ack(message);
          const messageObject = JSON.parse(messageContent);
          if (!messageObject.externalId || !messageObject.url) {
            Logger.error("Error: Invalid message format.");
            throw new Error("Invalid message format.");
          }
          if (
            typeof messageObject.externalId !== "string" &&
            typeof messageObject.externalId !== "string"
          ) {
            Logger.error("Error: Invalid message format.");
            throw new Error("Invalid message format.");
          }
          this.updateUserProfilePictureUseCase.execute({
            userId: messageObject.externalId,
            profilePicture: messageObject.url,
          });
          break;
        }
        default: {
          const errorMessage = `Error: Invalid Channel:"${channel}".`;
          Logger.error(errorMessage);
          throw new Error(errorMessage);
        }
      }
    });
  }
}
