import { CommandExecutor } from "../commandexecutor";
import { CommandDispatcher } from "../commanddispatcher";
import { CommandUtils } from "../commandutils";

export class LoginExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        const username = args.length >= 1 ? args.join(" ") : undefined;
        if(username != undefined) {
            const password = await CommandUtils.userInput(dispatcher.getParent().getMessage("command.login.passwordinput"), "", true);
            if(await dispatcher.getParent().getClient().login(username, password)) {
                dispatcher.sendLocalizedMessage("command.login.loggedin", username);
            } else {
                dispatcher.sendLocalizedMessage("command.login.invalid");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.login.usage");
        }
        return true;
    }
}