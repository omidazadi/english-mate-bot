import { RequestContext } from './context/request-context';

export class Router {
    private buttonTexts: any;

    public constructor(buttonTexts: any) {
        this.buttonTexts = buttonTexts;
    }

    public route(requestContext: RequestContext): string {
        if (
            requestContext.telegramContext.text ===
            this.buttonTexts.command.start
        ) {
            return 'word-reminder/jump';
        } else if (
            requestContext.telegramContext.text?.startsWith(
                this.buttonTexts.command.start + ' ',
            )
        ) {
            return 'add-word/public-bulk-show';
        } else if (
            requestContext.telegramContext.text === this.buttonTexts.command.cli
        ) {
            return 'admin/navigate-in';
        }

        if (requestContext.learner.data.state === 'word-reminder') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_reminder.review
            ) {
                return 'review-word/navigate-in';
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
        } else if (requestContext.learner.data.state === 'add-word-front') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.add_word_front.back
            ) {
                return 'add-word/navigate-out';
            } else {
                return 'add-word/front';
            }
        } else if (requestContext.learner.data.state === 'add-word-back') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.add_word_back.back
            ) {
                return 'add-word/navigate-out';
            } else {
                return 'add-word/back';
            }
        } else if (
            requestContext.learner.data.state === 'show-public-definitions'
        ) {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.show_public_definitions.yes
            ) {
                return 'add-word/public-bulk-add';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.show_public_definitions.back
            ) {
                return 'add-word/navigate-out';
            } else {
                return 'common/unknown';
            }
        } else if (requestContext.learner.data.state === 'review-word') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.review_word.back
            ) {
                return 'review-word/navigate-out';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.review_word.show_definition
            ) {
                return 'review-word/guess';
            } else {
                return 'common/unknown';
            }
        } else if (requestContext.learner.data.state === 'rate-word') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.rate_word.back
            ) {
                return 'review-word/navigate-out';
            } else if (
                requestContext.telegramContext.text ===
                    this.buttonTexts.state.rate_word.easy ||
                requestContext.telegramContext.text ===
                    this.buttonTexts.state.rate_word.good ||
                requestContext.telegramContext.text ===
                    this.buttonTexts.state.rate_word.hard ||
                requestContext.telegramContext.text ===
                    this.buttonTexts.state.rate_word.again
            ) {
                return 'review-word/rate';
            } else {
                return 'common/unknown';
            }
        } else if (requestContext.learner.data.state === 'browse-word') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.browse_word.back
            ) {
                return 'manage-word/navigate-out';
            } else {
                return 'manage-word/browse';
            }
        } else if (requestContext.learner.data.state === 'word-view') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_view.back
            ) {
                return 'manage-word/navigate-out';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_view.modify_word
            ) {
                return 'manage-word/navigate-to-modify';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.word_view.delete_word
            ) {
                return 'manage-word/navigate-to-delete';
            } else {
                return 'common/unknown';
            }
        } else if (requestContext.learner.data.state === 'modify-word') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.modify_word.back
            ) {
                return 'manage-word/navigate-to-view';
            } else {
                return 'manage-word/modify';
            }
        } else if (requestContext.learner.data.state === 'delete-word') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.delete_word.back
            ) {
                return 'manage-word/navigate-to-view';
            } else if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.delete_word.confirm
            ) {
                return 'manage-word/delete';
            } else {
                return 'common/unknown';
            }
        } else if (requestContext.learner.data.state === 'cli') {
            if (
                requestContext.telegramContext.text ===
                this.buttonTexts.state.cli.back
            ) {
                return 'admin/navigate-out';
            } else {
                return 'admin/command';
            }
        } else {
            return 'common/unknown';
        }
    }
}
