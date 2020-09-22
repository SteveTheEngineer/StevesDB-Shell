import { ParsedCommand } from "./parsedcommand";
import Readline from "readline";
import { Writable } from "stream";

export class CommandUtils {
    private static stdoutMuted: boolean = false;
    private static readonly readlineInterface: Readline.Interface = Readline.createInterface({input: process.stdin, output: new Writable({
        write: (chunk, encoding, callback) => {
            if(!CommandUtils.stdoutMuted) {
                process.stdout.write(chunk, encoding);
            }
            callback();
        }
    }), terminal: true});
    private constructor() {
        
    }

    public static parseCommand(commandString: string): ParsedCommand {
        const parts: string[] = commandString.split(" ");
        return {
            name: parts[0],
            args: parts.slice(1)
        };
    }

    public static userInput(text: string = "", def: string = "", hidden: boolean = false): Promise<string> {
        return new Promise(resolve => {
            /*process.stdout.write(text);
            if(!hidden) {
                process.stdin.once("data", (data: Buffer) => {
                    const string = data.toString().trim();
                    if(string.length > 0) {
                        resolve(string);
                    } else {
                        resolve(def);
                    }
                });
            } else {
                process.stdin.setRawMode(true);
                process.stdin.setEncoding("utf8");
                let input = "";
                const listener = (data: Buffer) => {
                    const char = data.toString("utf8");
                    switch (char) {
                        case "\u0004":
                        case "\r":
                        case "\n":
                            process.stdin.removeListener("data", listener);
                            process.stdin.setRawMode(false);
                            console.log("");
                            resolve(input);
                            break;
                        case "\u0003":
                            process.stdin.removeListener("data", listener);
                            process.stdin.setRawMode(false);
                            break;
                        default:
                            if(char.charCodeAt(0) === 8) {
                                input = input.slice(0, input.length - 1);
                            } else {
                                input += char;
                            }
                            break;
                    }
                }
                process.stdin.on("data", listener);
            }*/
            CommandUtils.readlineInterface.question(text, answer => {
                if(hidden) {
                    CommandUtils.stdoutMuted = false;
                    console.log();
                }
                if(answer !== "") {
                    resolve(answer);
                } else {
                    resolve(def);
                }
            });
            if(hidden) {
                CommandUtils.stdoutMuted = true;
            }
        });
    }
        
}