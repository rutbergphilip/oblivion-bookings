import { MythicPlusBoost } from './../template/mplusboost.template';
import { RequestRepository } from './../persistance/repositories/mplusrequests.repository';
import { Channels } from './../constants/channels.enum';
import { MythicPlusBuilder } from '../build/mplusSignups.build';
import { Emojis } from './../constants/emojis.enum';
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
import { MythicPlusCache } from '../cache/mplus.cache';
import { ActionRowBuilder } from '../build/rows.build';
export class MythicPlusRequestCollector {
  private readonly filter = (message: Message): boolean => {
    const isAuthor = message.author.id === this.interaction.user.id;
    const currentQuestion = this.questionIndex;

    switch (true) {
      case currentQuestion === 0:
        return (
          isAuthor &&
          parseInt(message.content) >= 0 &&
          parseInt(message.content) <= 24
        );
      case currentQuestion === 1:
        return (
          isAuthor &&
          parseInt(message.content) > 0 &&
          parseInt(message.content) <= 50
        );
      case currentQuestion === 2:
        return (
          isAuthor && ['0', '1', '2', '3'].some((m) => m === message.content)
        );
      case currentQuestion === 3:
        return isAuthor && /([a-zA-Z\s]+)/i.test(message.content);
      case currentQuestion === 4:
        return isAuthor && ['0', '1'].some((m) => m === message.content);
      case currentQuestion === 5:
        return isAuthor && /([a-zA-Z\s]+)/i.test(message.content);
      case currentQuestion === 6:
        return isAuthor;
      default:
        return false;
    }
  };
  private interaction: ButtonInteraction;
  private requestId: string;
  private bookingMessage: Message;
  private channel: TextChannel;
  private collector: MessageCollector;
  private readonly questions = [
    '**What key Level would you like (0-24)**',
    '**How many keys would you like?**',
    "**Select What type of armor you'd like (\n0 = Any,\n1 = Cloth,\n2 = Plate,\n3 = Mail,\n4 = Leather)**",
    '**Please type what specific key/Keys you would like separated with commas (`,`)**',
    '**Would you like the key(s) timed or not? (1 = Yes, 0 = No)**',
    '**Please type your desired payment realms separated with commas (`,`)**',
    '**Do you have any additional notes? If not, type `no`**',
  ];
  private askedQuestions: Message[] = [];
  private questionIndex = 0;

  constructor(interaction: ButtonInteraction, bookingMessage: Message) {
    this.interaction = interaction;
    this.requestId = bookingMessage.embeds[0].footer.text.replace('🆔: ', '');
    this.bookingMessage = bookingMessage;
    this.channel = <TextChannel>bookingMessage.channel;
    this.collector = this.channel.createMessageCollector({
      filter: this.filter,
      // time: 10000,
      time: 5 * 60000,
    });
  }

  async start() {
    const repository = new RequestRepository();
    const entity = await repository.get(this.requestId);
    await repository.update({
      ...entity,
      ...{
        hasActiveCollector: true,
      },
    });

    const initialQuestion = await this.channel.send({
      content: this.questions[this.questionIndex],
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
    this.clearChat();

    const processingMessage = await this.channel.send({
      content: `${Emojis.LOADING} Processing...`,
    });

    const allQuestionsAnswered =
      this.askedQuestions.length === this.questions.length;
    const requestToStop = message.content.toLowerCase() === 'stop';

    if (allQuestionsAnswered || requestToStop) {
      processingMessage.delete();
      return this.collector.stop();
    }

    this.bookingMessage.edit({
      embeds: [
        this.bookingMessage.embeds[0].addField(
          this.askedQuestions[this.questionIndex].content,
          message.content
        ),
      ],
      components: this.bookingMessage.components,
    });

    const question = await this.channel.send({
      content: this.questions[++this.questionIndex],
    });
    this.askedQuestions.push(question);

    processingMessage.delete();
  }

  private async onStop(collected: Collection<string, Message<boolean>>) {
    if (!this.channel.guild.channels.cache.get(this.channel.id)) {
      return;
    }

    try {
      const processingMessage = await this.channel.send({
        content: `${Emojis.LOADING} Processing...`,
      });

      if (collected.last()?.content?.toLowerCase() === 'stop') {
        await processingMessage.edit({
          content: `${Emojis.LOADING} Request cancelled, deleting this channel soon...`,
        });

        setTimeout(() => {
          this.channel.delete();
        }, 5000);
      } else if (collected.size !== this.questions.length) {
        await processingMessage.edit({
          content: `Process stopped with only ${collected.size} questions out of ${this.questions.length} answered.
  If you think this was a mistake, please open up a new ticket.
          
  Closing this ticket...`,
        });

        setTimeout(() => {
          this.channel.delete();
        }, 10000);
      } else {
        const requestId = this.bookingMessage.embeds[0].footer.text.replace(
          '🆔: ',
          ''
        );

        const messageOptions = await (
          await new MythicPlusBuilder(requestId).processData(collected)
        ).build();

        const repository = new RequestRepository();
        const entity = await repository.get(requestId);

        const boostMessage = await (<TextChannel>(
          this.channel.guild.channels.cache.get(entity.signupsChannelId)
        )).send(messageOptions);

        entity.signupsMessageId = boostMessage.id;

        await repository.update(entity);

        const boost = new MythicPlusBoost(
          entity.type,
          entity.faction,
          entity.customerId,
          entity._id
        );
        MythicPlusCache.set(this.requestId, boost);

        processingMessage.edit({
          content: `${Emojis.SUCCESS} Your request has been sent to the signups channel, please wait while we're filling your run.`,
        });

        setTimeout(async () => {
          const entity = await repository.get(requestId);
          if (!entity.hasStarted && !entity.isTeamTaken) {
            entity.isOpenForAll = true;
            repository.update(entity);
            boostMessage.edit({
              content: boostMessage.content,
              embeds: boostMessage.embeds,
              components:
                ActionRowBuilder.buildMythicPlusMembersSignupsRow(requestId),
            });
          }
        }, 10000);
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async clearChat() {
    const deletable = (await this.channel.messages.fetch()).filter(
      (m: Message) => !m.pinned
    );
    await this.channel.bulkDelete(deletable);
  }
}
