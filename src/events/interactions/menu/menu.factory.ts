import { Choice } from '../../../constants/choice.enum';
import { MythicPlusChoice } from './request-choices/mplus.choice';
import { PVPChoice } from './request-choices/pvp.choice';
import { TorghastChoice } from './request-choices/torghast.choice';
import { SelectMenuInteraction } from 'discord.js';

export class MenuFactory {
  async run(interaction: SelectMenuInteraction): Promise<void> {
    const choice = interaction.customId.toLowerCase().split('-')[0];
    try {
      switch (true) {
        case choice === Choice.MPLUS:
          break;
        case choice === Choice.TORGHAST:
          break;
        case choice === Choice.PVP:
          break;
        default:
          console.log(`Unknown choice: ${choice}`);
          break;
      }
    } catch (err) {
      console.error('Shit went wrong in the menu factory ', err);
    }
  }
}
