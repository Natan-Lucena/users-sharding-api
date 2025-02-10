export interface PubSub {
  listen(channel: string): Promise<void>;
}
