import { AllianceButton } from './mplus/alliance.button';
import { CancelButton } from './request-actions/cancel.button';
import { Action } from './../../../constants/action.enum';
import { ButtonInteraction } from 'discord.js';
import { HordeButton } from './mplus/horde.button';
import { RepostButton } from './request-actions/repost.button';
import { CompleteButton } from './request-actions/complete.button';

export class ButtonFactory {
  constructor() {}

  async allocateTask(interaction: ButtonInteraction): Promise<void> {
    const id = interaction.customId.toLowerCase();
    try {
      switch (true) {
        case id.includes(Action.COMPLETE):
          await CompleteButton.handle(interaction);
          break;
        case id.includes(Action.CANCEL):
          await CancelButton.handle(interaction);
          break;
        case id.includes(Action.REPOST):
          await RepostButton.handle(interaction);
          break;
        case id.includes(Action.HORDE_MPLUS):
          await HordeButton.handle(interaction);
          break;
        case id.includes(Action.ALLIANCE_MPLUS):
          await AllianceButton.handle(interaction);
          break;
        default:
          console.log(`Unknown action: ${id}`);
          break;
      }
    } catch (err) {
      console.error('Shit went wrong in the button factory ', err);
    }
  }
}
