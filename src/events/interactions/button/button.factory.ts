import { SignupButton } from './mplus/signup.button';
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
    const buttonType = interaction.customId.toLowerCase().split('-')[0];
    try {
      switch (true) {
        case buttonType === Action.COMPLETE:
          await CompleteButton.run(interaction);
          break;
        case buttonType === Action.CANCEL:
          await CancelButton.run(interaction);
          break;
        case buttonType === Action.REPOST:
          await RepostButton.run(interaction);
          break;
        case buttonType === Action.HORDE_MPLUS:
          await HordeButton.run(interaction);
          break;
        case buttonType === Action.ALLIANCE_MPLUS:
          await AllianceButton.run(interaction);
          break;
        case buttonType === Action.SIGNUP:
        case buttonType === Action.TANK:
        case buttonType === Action.HEALER:
        case buttonType === Action.DPS:
        case buttonType === Action.COLLECTOR:
        case buttonType === Action.KEYHOLDER:
        case buttonType === Action.TEAM_TAKE:
          await SignupButton.run(interaction);
          break;
        default:
          console.log(`Unknown action: ${buttonType}`);
          break;
      }
    } catch (err) {
      console.error('Shit went wrong in the button factory ', err);
    }
  }
}
