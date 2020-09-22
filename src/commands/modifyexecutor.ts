import { ComparatorOperation, EntryFilter, EntryValueOperation, TableColumn } from "stevesdb-client-node";
import { CommandDispatcher } from "../commanddispatcher";
import { CommandExecutor } from "../commandexecutor";
import { CommandUtils } from "../commandutils";

export class ModifyExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
            if(dispatcher.getParent().getSelectedTable() !== undefined) {
                if(args.length >= 1) {
                    const filter: string = args.join(" ");
                    try {
                        const jsonFilter: any = JSON.parse(filter);
                        const entryFilter: EntryFilter = {};
                        for(const column in jsonFilter) {
                            const value: any = jsonFilter[column];
                            if(typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                                entryFilter[column] = value;
                            } else if(typeof value === "object") {
                                const operation: any = value["operation"];
                                const comparedValue: any = value["value"];
                                let comparatorOperation: ComparatorOperation;
                                if(operation == undefined) {
                                    dispatcher.sendLocalizedMessage("command.modify.filter.column.nooperation", column);
                                    return true;
                                } else if(comparedValue == undefined) {
                                    dispatcher.sendLocalizedMessage("command.modify.filter.column.novalue", column);
                                    return true;
                                }
                                if(typeof operation === "string") {
                                    comparatorOperation = eval(`require("stevesdb-client-node").ComparatorOperation[\"${operation}\"]`);
                                    if(comparatorOperation == undefined) {
                                        dispatcher.sendLocalizedMessage("command.modify.filter.column.invalidoperation", column);
                                        return true;
                                    }
                                } else if(typeof operation === "number") {
                                    comparatorOperation = operation;
                                } else {
                                    dispatcher.sendLocalizedMessage("command.modify.filter.column.invalidoperationtype", column);
                                    return true;
                                }
                                if(typeof comparedValue === "string" || typeof comparedValue === "boolean" || typeof comparedValue === "number") {
                                    entryFilter[column] = {
                                        operation: comparatorOperation,
                                        value: comparedValue
                                    };
                                } else {
                                    dispatcher.sendLocalizedMessage("command.modify.filter.column.invalidvaluetype", column);
                                    return true;
                                }
                            } else {
                                dispatcher.sendLocalizedMessage("command.modify.filter.column.invalid", column, value);
                                return true;
                            }
                        }
                        const name: string = await CommandUtils.userInput(dispatcher.getParent().getMessage("command.modify.columninput"));
                        let modifierOperation: EntryValueOperation | undefined;
                        const strOperation: string = await CommandUtils.userInput(dispatcher.getParent().getMessage("command.modify.operationinput"), "=");
                        if(strOperation === "=") {
                            modifierOperation = EntryValueOperation.SET;
                        } else if(strOperation === "+") {
                            modifierOperation = EntryValueOperation.ADD;
                        } else if(strOperation === "-") {
                            modifierOperation = EntryValueOperation.SUBTRACT;
                        } else {
                            dispatcher.sendLocalizedMessage("command.modify.invalidoperation", strOperation);
                            return true;
                        }
                        const modifierValue: string = await CommandUtils.userInput(dispatcher.getParent().getMessage("command.modify.valueinput"));
                        if(await dispatcher.getParent().getSelectedTable()?.modifyEntries(entryFilter, {
                            [name]: {
                                operation: modifierOperation,
                                value: modifierValue
                            }
                        })) {
                            dispatcher.sendLocalizedMessage("command.modify.modified");
                        } else {
                            dispatcher.sendLocalizedMessage("command.modify.nomatch");
                        }
                    } catch(e) {
                        dispatcher.sendLocalizedMessage("command.modify.filter.invalid");
                    }
                } else {
                    dispatcher.sendLocalizedMessage("command.modify.usage");
                }
            } else {
                dispatcher.sendLocalizedMessage("command.modify.notable");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.modify.unauthorized");
        }
        return true;
    }
}