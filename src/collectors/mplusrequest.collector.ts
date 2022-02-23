import {
  ButtonInteraction,
  Collection,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageCollector,
  MessageSelectMenu,
  SelectMenuInteraction,
  TextChannel,
} from 'discord.js';
import { Dungeons } from '../constants/dungeons.enum';

export class MythicPlusRequestCollector {
  private readonly filter = (message: Message): boolean => {
    const isAuthor = message.author.id === this.interaction.user.id;
    const currentQuestion = this.questionIndex;

    switch (true) {
      case currentQuestion === 1:
        return (
          isAuthor &&
          parseInt(message.content) >= 0 &&
          parseInt(message.content) <= 24
        );
      case currentQuestion === 2:
        return (
          (isAuthor &&
            parseInt(message.content) > 0 &&
            parseInt(message.content) <= 50) ||
          /back/i.test(message.content)
        );
      case currentQuestion === 3:
        return isAuthor && /0|1|back/i.test(message.content);
      case currentQuestion === 4:
        return isAuthor && /0|1|2|3|back/i.test(message.content);
      case currentQuestion === 5:
        return isAuthor && /0|1|back/i.test(message.content);
      case currentQuestion === 6:
        return isAuthor && /([a-zA-Z\s]+)|back/i.test(message.content);
      case currentQuestion === 7:
        return isAuthor && /0|1|back/i.test(message.content);
      case currentQuestion === 8:
        return isAuthor && /([a-zA-Z\s]+)|back/i.test(message.content);
      case currentQuestion === 9:
        return isAuthor;
      default:
        return false;
    }
  };
  private interaction: ButtonInteraction;
  private bookingMessage: Message;
  private channel: TextChannel;
  private collector: MessageCollector;
  private readonly questions: string[] = [
    '**Key Level (0-24)**',
    '**How many keys would you like?**',
    '**Would you like Armor Stack? (Yes = 1, No = 0)**',
    "**Select What type of armor you'd like (0=cloth, 1=plate, 2=mail, 3=leather)**",
    '**Specific Key (Yes=1, No=0)**',
    '**Please type what specific key/Keys you would like separated with commas (`,`)**',
    '**Would you like the key(s) timed or not? (Yes = 1, No = 0)**',
    '**Please type your desired payment realms separated with commas (`,`)**',
    '**Do you have any additional notes? If not, type `no`**',
  ];
  private askedQuestions: Message[] = [];
  private questionIndex = 0;

  constructor(interaction: ButtonInteraction, bookingMessage: Message) {
    this.interaction = interaction;
    this.bookingMessage = bookingMessage;
    this.channel = <TextChannel>bookingMessage.channel;
    this.collector = this.channel.createMessageCollector({
      filter: this.filter,
      time: 5 * 60000,
    });
  }

  async start() {
    const initialQuestion = await this.channel.send({
      content: this.questions[this.questionIndex++],
    });
    this.askedQuestions.push(initialQuestion);

    this.collector.on('collect', (message) => {
      this.onCollect(message);
    });

    this.collector.on('end', async (collected) => {
      this.onStop(collected);
    });
  }

  private async onCollect(message: Message): Promise<void | Message<boolean>> {
    const deletable = (await this.channel.messages.fetch()).filter(
      (m: Message) => !m.pinned
    );
    await this.channel.bulkDelete(deletable);

    if (
      this.collector.collected.size === this.questions.length ||
      message.content === 'stop'
    ) {
      return this.collector.stop();
    } else if (message.content === 'back') {
      this.collector.collected.delete(this.collector.collected.last().id);
      this.askedQuestions.pop();
      this.questionIndex--;

      const question = await this.channel.send({
        content: this.questions[this.questionIndex],
      });
      this.askedQuestions.push(question);
      return;
    }

    const question = await this.channel.send({
      content: this.questions[this.questionIndex++],
    });
    this.askedQuestions.push(question);
  }

  private async onStop(collected: Collection<string, Message<boolean>>) {}
}
