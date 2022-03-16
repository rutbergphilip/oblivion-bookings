import { SignupButton } from './mplus/signup.button';
import { AllianceButton } from './mplus/alliance.button';
import { CancelButton } from './request-actions/cancel.button';
import { Action } from './../../../constants/action.enum';
import { ButtonInteraction } from 'discord.js';
import { HordeButton } from './mplus/horde.button';
import { RepostButton } from './request-actions/repost.button';
import { CompleteButton } from './request-actions/complete.button';

export class ButtonFactory {
  async run(interaction: ButtonInteraction): Promise<void> {
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
        case buttonType === Action.HORDE:
          await HordeButton.run(interaction);
          break;
        case buttonType === Action.ALLIANCE:
          await AllianceButton.run(interaction);
          break;
        case [
          Action.SIGNUP,
          Action.TANK,
          Action.HEALER,
          Action.DPS,
          Action.COLLECTOR,
          Action.KEYHOLDER,
          Action.TEAM_TAKE,
        ].some((action) => action === buttonType):
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
