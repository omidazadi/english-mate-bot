import { readFile } from 'fs/promises';
import { RequestContext } from './context/request-context';

export class Router {
    private buttonTexts: any;

    public async configure() {
        this.buttonTexts = JSON.parse(
            (await readFile('src/ui/button-texts.json', 'utf8')).toString(),
        );
    }

    public route(requestContext: RequestContext): string {
        if (
            requestContext.telegramContext.text ===
            this.buttonTexts.command.start
        ) {
            return 'word-reminder/jump';
        }

        if (requestContext.user.data.state === 'word-reminder') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_reminder.review
            ) {
                return 'review-word/guess';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_reminder.add
            ) {
                return 'add-word/navigate-in';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_reminder.manage
            ) {
                return 'manage-word/navigate-in';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_reminder.statistics
            ) {
                return 'word-reminder/statistics';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_reminder.talk_to_admin
            ) {
                return 'word-reminder/talk-to-admin';
            } else {
                return 'common/unknown';
            }
        } else if (requestContext.user.data.state === 'add-word-front') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.add_word_front.back
            ) {
                return 'add-word/navigate-out';
            } else {
                return 'add-word/front';
            }
        } else if (requestContext.user.data.state === 'add-word-back') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.add_word_back.back
            ) {
                return 'add-word/navigate-out';
            } else {
                return 'add-word/back';
            }
        } else {
            return 'common/unknown';
        }
    }
}
