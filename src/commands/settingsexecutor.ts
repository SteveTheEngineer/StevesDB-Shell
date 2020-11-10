import { CommandDispatcher } from "../commanddispatcher";
import { CommandExecutor } from "../commandexecutor";
import { CommandRegistry } from "../commandregistry";
import { NamespacedKey } from "../namespacedkey";

export class SettingsExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(args.length >= 1) {
            const setting: string = args[0];
            if(setting === "locale") {
                if(args.length >= 2) {
                    const operation: string = args[1];
                    if(operation === "get") {
                        dispatcher.sendLocalizedMessage("command.settings.locale.get", dispatcher.getParent().getUserSettings().locale, dispatcher.getParent().getMessage("locale.name"));
                    } else if(operation === "set") {
                        if(args.length === 3) {
                            if(dispatcher.getParent().getLocales().includes(args[2])) {
                                dispatcher.getParent().getUserSettings().locale = args[2];
                                dispatcher.getParent().saveUserSettings();
                                dispatcher.sendLocalizedMessage("command.settings.locale.set.set", args[2]);
                            } else {
                                dispatcher.sendLocalizedMessage("command.settings.locale.set.invalid", args[2]);
                            }
                        } else {
                            dispatcher.sendLocalizedMessage("command.settings.locale.set.usage");
                        }
                    } else if(operation === "available") {
                        dispatcher.sendLocalizedMessage("command.settings.locale.available.header", dispatcher.getParent().getLocales().map(locale => dispatcher.getParent().getMessage("command.settings.locale.available.entry", locale)).join(dispatcher.getParent().getMessage("command.settings.locale.available.separator")));
                    } else {
                        dispatcher.sendLocalizedMessage("command.settings.locale.usage");
                    }
                } else {
                    dispatcher.sendLocalizedMessage("command.settings.locale.usage");
                }
            } else if(setting === "aliases") {
                const operation: string = args[1];
                if(operation === "list") {
                    dispatcher.sendLocalizedMessage("command.settings.aliases.list.header", Object.entries(dispatcher.getParent().getUserSettings().aliases).map(alias => dispatcher.getParent().getMessage("command.settings.aliases.list.entry", alias[0], alias[1])).join(dispatcher.getParent().getMessage("command.settings.aliases.list.separator")));
                } else if(operation === "set") {
                    if(args.length === 4) {
                        const alias: string = args[2];
                        const command: NamespacedKey | undefined = CommandRegistry.REGISTRY.lookupCommand(args[3]);
                        if(command !== undefined) {
                            dispatcher.getParent().getUserSettings().aliases[alias] = command.toString();
                            dispatcher.getParent().refreshCommandsAndAliases();
                            dispatcher.getParent().saveUserSettings();
                            dispatcher.sendLocalizedMessage("command.settings.aliases.set.set", alias, args[3]);
                        } else {
                            dispatcher.sendLocalizedMessage("command.settings.aliases.set.invalid", alias, args[3]);
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.settings.aliases.set.usage");
                    }
                } else if(operation === "remove") {
                    if(args.length === 3) {
                        const alias: string = args[2];
                        if(Object.keys(dispatcher.getParent().getUserSettings().aliases).includes(alias)) {
                            delete dispatcher.getParent().getUserSettings().aliases[alias];
                            dispatcher.getParent().refreshCommandsAndAliases();
                            dispatcher.getParent().saveUserSettings();
                            dispatcher.sendLocalizedMessage("command.settings.aliases.remove.removed", alias);
                        } else {
                            dispatcher.sendLocalizedMessage("command.settings.aliases.remove.invalid", alias);
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.settings.aliases.remove.usage");
                    }
                } else {
                    dispatcher.sendLocalizedMessage("command.settings.aliases.usage");
                }
            } else {
                dispatcher.sendLocalizedMessage("command.settings.usage");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.settings.usage");
        }
        return true;
    }
}