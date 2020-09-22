#!/usr/bin/env node

import { CommandDispatcher } from "./commanddispatcher";
import { CommandRegistry } from "./commandregistry";
import { NamespacedKey } from "./namespacedkey";
import { CommandUtils } from "./commandutils";

import { StevesDBClient, Database, Table } from "stevesdb-client-node";

import { SelectExecutor } from "./commands/selectexecutor";
import { LoginExecutor } from "./commands/loginexecutor";
import { ExitExecutor } from "./commands/exitexecutor";
import { ClearExecutor } from "./commands/clearexecutor";
import { LogoutExecutor } from "./commands/logoutexecutor";
import { DeselectExecutor } from "./commands/deselectexecutor";
import { ListExecutor } from "./commands/listexecutor";
import { AddExecutor } from "./commands/addexecutor";
import { DeleteExecutor } from "./commands/deleteexecutor";
import { ModifyExecutor } from "./commands/modifyexecutor";
import { ColumnsExecutor } from "./commands/columnsexecutor";
import { RenameExecutor } from "./commands/renamexecutor";

import FileSystem from "fs";
import Path from "path";
import { HelpExecutor } from "./commands/helpexecutor";
import OperatingSystem from "os";
import { UserSettings } from "./usersettings";
import { SettingsExecutor } from "./commands/settingsexecutor";

import commander, { Command } from "commander";

export class StevesDBShell {
    private static readonly instance: StevesDBShell = new StevesDBShell();
    private readonly dispatcher: CommandDispatcher = new CommandDispatcher(CommandRegistry.REGISTRY, this);
    private readonly client: StevesDBClient = new StevesDBClient();

    private host: string | undefined;
    private port: number | undefined;

    private selectedDatabase: Database | undefined;
    private selectedTable: Table | undefined;

    private locales: {[locale: string]: {[key: string]: string | string[]}} = {};
    private fallbackLocale: string;
    
    private settingsFile: string = Path.resolve(OperatingSystem.homedir(), ".stevesdbshell.json");
    private defaultSettings: UserSettings;
    private userSettings: UserSettings;

    private readonly program: commander.Command = new Command();

    private constructor() {
        this.program.version(`StevesDB CLI ${require(Path.resolve(__dirname, "..", "package.json")).version}`);

        this.program.option("--encryption", "automatically enable the encryption");
        this.program.option("--noencryption", "automatically disable the encryption");
        this.program.option("--host <server host>", "server host");
        this.program.option("--port <server port>", "server port");
        this.program.option("--username <username>", "user username");
        this.program.option("--password <password>", "user password");

        this.program.parse(process.argv);

        const localesDir: string = Path.resolve(__dirname, "..", "locales");
        for(const f of FileSystem.readdirSync(localesDir, {withFileTypes: true}).filter(dirent => dirent.isFile() && dirent.name.endsWith(".json") && dirent.name !== "_settings.json")) {
            this.locales[f.name.slice(0, f.name.length - 5)] = JSON.parse(FileSystem.readFileSync(Path.join(localesDir, f.name)).toString("utf-8"));
        }
        const settings: {fallbackLocale: string} = JSON.parse(FileSystem.readFileSync(Path.resolve(localesDir, "_settings.json")).toString("utf-8"));
        this.fallbackLocale = settings.fallbackLocale;

        const defaultSettingsFile: string = Path.resolve(__dirname, "..", "default-settings.json");
        this.defaultSettings = JSON.parse(FileSystem.readFileSync(defaultSettingsFile).toString("utf-8"));

        if(FileSystem.existsSync(this.settingsFile)) {
            this.userSettings = JSON.parse(FileSystem.readFileSync(this.settingsFile).toString("utf-8"));
        } else {
            this.userSettings = {...this.defaultSettings};
            this.saveUserSettings();
        }

        this.refreshCommandsAndAliases();
        this.init();
    }

    public getLocales(): string[] {
        return Object.keys(this.locales);
    }

    public getUserSettings(): UserSettings {
        return this.userSettings;
    }

    public saveUserSettings(): void {
        FileSystem.writeFileSync(this.settingsFile, JSON.stringify(this.userSettings));
    }

    public getSelectedDatabase(): Database | undefined {
        return this.selectedDatabase;
    }

    public setSelectedDatabase(selectedDatabase: Database | undefined): void {
        this.selectedDatabase = selectedDatabase;
    }

    public getSelectedTable(): Table | undefined {
        return this.selectedTable;
    }
    
    public setSelectedTable(selectedTable: Table | undefined): void {
        this.selectedTable = selectedTable;
    }

    private async init(): Promise<void> {
        await this.promptHostname();
        await this.acceptInput();
    }

    public getClient(): StevesDBClient {
        return this.client;
    }

    private async promptHostname(): Promise<void> {
        if(this.program.host) {
            this.host = this.program.host;
        } else {
            this.host = await CommandUtils.userInput(this.getMessage("connection.hostinput"), "127.0.0.1");
        }
        if(this.program.port) {
            this.port = Math.min(65535, Math.max(0, parseInt(this.program.port)));
        } else {
            this.port = Math.min(65535, Math.max(0, parseInt(await CommandUtils.userInput(this.getMessage("connection.portinput"), "2540"))));
        }
        let encryption: boolean;
        if(this.program.encryption) {
            encryption = true;
        } else if(this.program.noencryption) {
            encryption = false;
        } else {
            encryption = (await CommandUtils.userInput(this.getMessage("connection.encryptioninput"), this.getMessage("connection.encryptionconfirmation"))).toLowerCase() === this.getMessage("connection.encryptionconfirmation");
        }

        if(this.host === undefined) {
            this.host = "127.0.0.1";
        }

        this.dispatcher.sendLocalizedMessage("connection.connecting");
        try {
            await this.client.connect(this.host, this.port, { encryption });
            this.dispatcher.sendLocalizedMessage("connection.connected");
            if(this.program.username) {
                if(this.program.password) {
                    if(await this.client.login(this.program.username, this.program.password)) {
                        this.dispatcher.sendLocalizedMessage("command.login.loggedin", this.program.username);
                    } else {
                        this.dispatcher.sendLocalizedMessage("command.login.invalid");
                    }
                } else {
                    await this.dispatcher.dispatchCommand(`stevesdbshell:login ${this.program.username}`);
                }
            }
        } catch (error) {
            this.dispatcher.sendLocalizedMessage(`connection.failed.${`${error}`.replace(/[ \[\]\>\<\=\:\_\.]/g, "").toLowerCase()}`);
            process.exit(1);
        }
    }

    private async acceptInput(): Promise<void> {
        while(true) {
            if(!await this.dispatcher.dispatchCommand(await CommandUtils.userInput(`\u001b[36;1m${this.client.getUsername() != undefined ? this.client.getUsername() + "@" : ""}${this.host + ":" + this.port}${this.selectedDatabase != undefined ? " \u001b[0m" + this.selectedDatabase.getName() : ""}${this.selectedTable != undefined ? "\u001b[36;1m:\u001b[0m" + this.selectedTable.getName() : ""} \u001b[32m>> \u001b[0m`))) {
                this.dispatcher.sendLocalizedMessage("dispatcher.unknowncommand");
            }
        }
    }

    public refreshCommandsAndAliases(): void {
        CommandRegistry.REGISTRY.clear();

        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "select"), new SelectExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "login"), new LoginExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "exit"), new ExitExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "clear"), new ClearExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "logout"), new LogoutExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "deselect"), new DeselectExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "list"), new ListExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "add"), new AddExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "delete"), new DeleteExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "modify"), new ModifyExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "columns"), new ColumnsExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "rename"), new RenameExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "help"), new HelpExecutor());
        CommandRegistry.REGISTRY.register(new NamespacedKey("stevesdbshell", "settings"), new SettingsExecutor());

        for(const key in this.userSettings.aliases) {
            const command: NamespacedKey | undefined = NamespacedKey.fromString(this.userSettings.aliases[key])
            if(command != undefined) {
                CommandRegistry.REGISTRY.addAlias(key, command);
            }
        }
    }

    public getMessage(key: string, ...objects: any): string {
        let translationCandidate: string | string[];
        if(this.locales[this.userSettings.locale] != undefined && this.locales[this.userSettings.locale][key] != undefined) {
            translationCandidate = this.locales[this.userSettings.locale][key];
        } else if(this.locales[this.fallbackLocale] != undefined && this.locales[this.fallbackLocale][key] != undefined) {
            translationCandidate = this.locales[this.fallbackLocale][key];
        } else {
            return key;
        }
        let translation: string;
        if(typeof translationCandidate === "object" && translationCandidate instanceof Array) {
            translation = translationCandidate.join("\n");
        } else {
            translation = translationCandidate;
        }
        for(const index in objects) {
            translation = translation.replace(`{${index}}`, objects[index]);
        }
        return translation;
    }

    public static getInstance(): StevesDBShell {
        return StevesDBShell.instance;
    }
}