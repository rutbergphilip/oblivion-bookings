import { Emojis } from './../constants/emojis.enum';
import { Roles } from './../constants/roles.enum';
import { Colors } from '../constants/colors.enum';
import { Factions } from '../constants/factions.enum';
import { Global } from '../constants/global.enum';
import { RequestRepository } from '../persistance/repositories/mplusrequests.repository';
import { Collection, Message, MessageEmbed, MessageOptions } from 'discord.js';
import { ActionRowBuilder } from './rows.build';
import { Channels } from '../constants/channels.enum';

export class MythicPlusBuilder {
  private requestId: string;
  private keyLevel: string;
  private amountKeys: string;
  private armorStack: string;
  private timed: string;
  private keys: string;
  private paymentRealms: string;
  private notes: string;
  private answers: { name: string; value: string; inline: boolean }[] = [];
  private faction: Factions;

  constructor(requestId: string) {
    this.requestId = requestId;
  }

  async processData(collected: Collection<string, Message<boolean>>) {
    const requestRepository = new RequestRepository();
    const entity = await requestRepository.get(this.requestId);
    this.faction = entity.faction;

    await this.validateQuestions(collected);

    await requestRepository.update({
      ...entity,
      ...{
        signupsChannelId: this.getChannel(),
        faction: this.faction,
        keyInfo: {
          keyLevel: this.keyLevel,
          amountKeys: this.amountKeys,
          armorStack: this.armorStack,
          keys: this.keys,
          timed: this.timed,
          paymentRealms: this.paymentRealms,
          notes: this.notes,
        },
      },
    });

    return this;
  }

  private async validateQuestions(
    collected: Collection<string, Message<boolean>>
  ) {
    const mapped = collected.map((message) => message.content.trim());
    mapped.forEach((answer, index) => {
      switch (index) {
        case 0:
          this.keyLevel = answer;
          this.answers.push({
            name: 'Key level',
            value: this.keyLevel,
            inline: true,
          });
          break;
        case 1:
          this.amountKeys = answer;
          this.answers.push({
            name: 'Amount of keys',
            value: this.amountKeys,
            inline: true,
          });
          break;
        case 2:
          this.armorStack =
            answer == '0'
              ? 'Random'
              : answer == '1'
              ? 'Cloth'
              : answer == '2'
              ? 'Plate'
              : answer == '3'
              ? 'Mail'
              : 'Leather';
          this.answers.push({
            name: 'Armor stack',
            value: this.armorStack,
            inline: true,
          });
          break;
        case 3:
          this.keys = answer;
          this.answers.push({ name: 'Keys', value: this.keys, inline: true });
          break;
        case 4:
          this.timed = answer == '1' ? `${Emojis.CHECK} Yes` : `${Emojis.X} No`;
          this.answers.push({ name: 'Timed', value: this.timed, inline: true });
          break;
        case 5:
          this.paymentRealms = answer;
          this.answers.push({
            name: 'Payment realms',
            value: this.paymentRealms,
            inline: true,
          });
          break;
        case 6:
          this.notes = answer === 'no' ? undefined : answer;
          this.answers.push({
            name: 'Additional notes',
            value: this.notes,
            inline: true,
          });
          break;
      }
    });
  }

  async build(): Promise<MessageOptions> {
    const rolesToPing =
      this.faction === Factions.HORDE
        ? this.getHordeRoles()
        : this.getAllianceRoles();

    return {
      content: rolesToPing.map((roleId) => `<@&${roleId}>`).join(' '),
      embeds: [
        new MessageEmbed()
          .setTitle('Mythic Plus Request')
          .setDescription(`${Emojis.TEAMLEADER} Team Leader`)
          .addFields(this.answers.filter((answer) => answer.value))
          .setFooter({
            text: `🆔: ${this.requestId}`,
          })
          .setColor(Colors.BOOST_CREATING)
          .setTimestamp(),
      ],
      components: [
        ActionRowBuilder.buildMythicPlusTeamsSignupsRow(this.requestId),
      ],
    };
  }

  private getHordeRoles(): Roles[] {
    return this.keyLevel <= Global.HIGH_KEY_MEMBER_MAXIMUM
      ? [Roles.H_VERIFIED_LEADER]
      : [Roles.H_ALL_STAR_LEADER, Roles.H_VERIFIED_LEADER];
  }

  private getAllianceRoles(): Roles[] {
    return this.keyLevel <= Global.HIGH_KEY_MEMBER_MAXIMUM
      ? [Roles.A_VERIFIED_LEADER]
      : [Roles.A_ALL_STAR_LEADER, Roles.A_VERIFIED_LEADER];
  }

  private getChannel(): string {
    const isHorde = this.faction === Factions.HORDE;
    const isHighKey = this.keyLevel <= Global.HIGH_KEY_MEMBER_MAXIMUM;

    if (isHorde) {
      return isHighKey
        ? Channels.HIGH_KEY_BOOKINGS_H
        : Channels.ALL_STAR_BOOKINGS_H;
    } else {
      return isHighKey
        ? Channels.HIGH_KEY_BOOKINGS_A
        : Channels.ALL_STAR_BOOKINGS_A;
    }
  }
}
