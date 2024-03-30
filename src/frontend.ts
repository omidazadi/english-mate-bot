import { readFile, stat } from 'fs/promises';
import { Bot as GrammyBot, InlineKeyboard, Keyboard } from 'grammy';
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'grammy/types';
import nunjucks from 'nunjucks';

export class Frontend {
    private grammyBot: GrammyBot;
    private buttonTexts: any;

    public constructor(grammyBot: GrammyBot) {
        this.grammyBot = grammyBot;
    }

    public async configure() {
        this.buttonTexts = JSON.parse(
            (await readFile('src/ui/button-texts.json', 'utf8')).toString(),
        );
        nunjucks.configure({ trimBlocks: true, lstripBlocks: true });
    }

    public async sendActionMessage(
        tid: string,
        action: string,
        options?: {
            context?: object;
            media?: string;
        },
    ): Promise<void> {
        let context = this.buildHydratedContext(options);
        let text = nunjucks.render(
            `src/ui/action-views/${action}.njk`,
            context,
        );
        await this.grammyBot.api.sendMessage(parseInt(tid), text, {
            reply_markup: await this.buildButtons(
                `src/ui/action-views/${action}`,
                context,
            ),
            parse_mode: 'HTML',
        });
    }

    public async sendSystemMessage(
        tid: string,
        messageType: string,
        options?: {
            context?: object;
            media?: string;
        },
    ): Promise<void> {
        let context = this.buildHydratedContext(options);
        let text = nunjucks.render(
            `src/ui/system-views/${messageType}.njk`,
            context,
        );
        await this.grammyBot.api.sendMessage(parseInt(tid), text, {
            reply_markup: await this.buildButtons(
                `src/ui/system-views/${messageType}`,
                context,
            ),
            parse_mode: 'HTML',
        });
    }

    private buildHydratedContext(options: any): any {
        let context: any = {};
        if (typeof options !== 'undefined') {
            if (typeof options.context !== 'undefined') {
                context = options.context;
            }
        }
        context.buttonTexts = this.buttonTexts;
        return context;
    }

    private async buildButtons(
        prefixPath: string,
        context: object,
    ): Promise<ReplyKeyboardMarkup | InlineKeyboardMarkup | undefined> {
        let buttonType = 'none';
        try {
            await stat(`${prefixPath}-keyboard.njk`);
            buttonType = 'keyboard';
        } catch (e: unknown) {}

        try {
            await stat(`${prefixPath}-inline.njk`);
            buttonType = 'inline';
        } catch (e: unknown) {}

        try {
            await stat(`${prefixPath}-url.njk`);
            buttonType = 'url';
        } catch (e: unknown) {}

        if (buttonType === 'keyboard') {
            return this.buildKeyboardButtons(prefixPath, context);
        } else if (buttonType === 'inline') {
            return this.buildInlineButtons(prefixPath, context);
        } else if (buttonType === 'url') {
            return this.buildUrlButtons(prefixPath, context);
        }
        return undefined;
    }

    private buildKeyboardButtons(
        prefixPath: string,
        context: object,
    ): Keyboard {
        let rawKeyboardButtons = JSON.parse(
            nunjucks.render(`${prefixPath}-keyboard.njk`, context),
        );

        let keyboardButtons = new Keyboard();
        for (let buttonRow of rawKeyboardButtons) {
            for (let button of buttonRow) {
                keyboardButtons = keyboardButtons.text(button);
            }
            keyboardButtons = keyboardButtons.row();
        }
        keyboardButtons = keyboardButtons.resized(true);
        return keyboardButtons;
    }

    private buildInlineButtons(
        prefixPath: string,
        context: object,
    ): InlineKeyboard {
        let rawInlineButtons = JSON.parse(
            nunjucks.render(`${prefixPath}-inline.njk`, context),
        );

        let inlineButtons = new InlineKeyboard();
        for (let buttonRow of rawInlineButtons) {
            for (let button of buttonRow) {
                inlineButtons = inlineButtons.text(button.text, button.data);
            }
            inlineButtons = inlineButtons.row();
        }
        return inlineButtons;
    }

    private buildUrlButtons(
        prefixPath: string,
        context: object,
    ): InlineKeyboard {
        let rawUrlButtons = JSON.parse(
            nunjucks.render(`${prefixPath}-url.njk`, context),
        );

        let urlButtons = new InlineKeyboard();
        for (let buttonRow of rawUrlButtons) {
            for (let button of buttonRow) {
                urlButtons = urlButtons.url(button.text, button.url);
            }
            urlButtons = urlButtons.row();
        }
        return urlButtons;
    }
}
