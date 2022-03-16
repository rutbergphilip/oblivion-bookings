import { Interaction } from 'discord.js';
import { ButtonFactory } from './button/button.factory';
import { MenuFactory } from './menu/menu.factory';

export class InteractionFactory {
  static get(interaction: Interaction): ButtonFactory | MenuFactory {
    switch (true) {
      case interaction.isButton():
        return new ButtonFactory();
      case interaction.isSelectMenu():
        return new MenuFactory();
      default:
        console.log(`Unknown interaction: ${interaction.type}`);
        break;
    }
  }
}
