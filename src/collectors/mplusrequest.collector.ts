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
    switch (true) {
      case this.questionIndex === 1:
        return (
          isAuthor &&
          parseInt(message.content) >= 0 &&
          parseInt(message.content) <= 24
        );
      case this.questionIndex === 2:
        return (
          isAuthor &&
          parseInt(message.content) > 0 &&
          parseInt(message.content) <= 50
        );
      case this.questionIndex === 3:
        return isAuthor && /0|1/.test(message.content);
      case this.questionIndex === 4:
        return isAuthor && /0|1|2|3/.test(message.content);
      case this.questionIndex === 5:
        return isAuthor && /0|1/.test(message.content);
      case this.questionIndex === 6:
        return isAuthor && /([a-zA-Z\s]+)/.test(message.content);
      case this.questionIndex === 7:
        return isAuthor && /0|1/.test(message.content);
      case this.questionIndex === 8:
        return isAuthor && /([a-zA-Z\s]+)/.test(message.content);
      case this.questionIndex === 9:
        return isAuthor;
      default:
        return false;
    }
  };
  private interaction: ButtonInteraction;
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
  private questionIndex = 0;

  async start(interaction: ButtonInteraction, channel: TextChannel) {
    this.interaction = interaction;
    this.collector = channel.createMessageCollector({
      filter: this.filter,
      time: 5 * 60000,
    });
    await channel.send({ content: this.questions[this.questionIndex++] });
    this.collector.on('collect', (message) => {
      console.log(message.content);
      if (this.questionIndex < this.questions.length) {
        channel.send({ content: this.questions[this.questionIndex++] });
      }
    });

    this.collector.on('end', async (collected) => {
      this.onStop(collected);
    });
  }

  private async onStop(collected: Collection<string, Message<boolean>>) {}

  // private buildKeyPicker(): MessageActionRow {
  //   return new MessageActionRow()
  //     .addComponents(
  //       new MessageSelectMenu()
  //       .setMaxValues(1)
  //       .setMinValues(1)
  //         .addOptions()
  //     )
  // }
}
