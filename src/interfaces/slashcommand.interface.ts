export interface SlashCommand {
  name: string;
  run(): Promise<any>;
}
