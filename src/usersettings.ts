export interface UserSettings {
    locale: string;
    aliases: {
        [key: string]: string;
    };
}