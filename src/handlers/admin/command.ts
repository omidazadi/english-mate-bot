import { Bot as GrammyBot } from 'grammy';
import { BotConfig } from '../../configs/bot-config';
import { ClassroomConfig } from '../../configs/classroom-config';
import { Constant } from '../../constants/constant';
import { RequestContext } from '../../context/request-context';
import { Word } from '../../database/models/word';
import { Repository } from '../../database/repositories/repository';
import { Frontend } from '../../frontend';
import { Handler } from '../handler';

export class AdminCommandHandler extends Handler {
    private grammyBot: GrammyBot;
    private classroomConfig: ClassroomConfig;
    private botConfig: BotConfig;

    public constructor(
        repository: Repository,
        frontend: Frontend,
        constant: Constant,
        grammyBot: GrammyBot,
        classroomConfig: ClassroomConfig,
        botConfig: BotConfig,
    ) {
        super(repository, frontend, constant);
        this.grammyBot = grammyBot;
        this.classroomConfig = classroomConfig;
        this.botConfig = botConfig;
    }

    public async handle(requestContext: RequestContext): Promise<void> {
        const tokens = this.parseCommand(requestContext.telegramContext.text);

        if (tokens[0] === 'version') {
            if (tokens.length != 1) {
                await this.error(requestContext);
                return;
            }

            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'admin/command',
                {
                    context: {
                        scenario: 'version',
                        version: this.botConfig.version,
                    },
                },
            );
        } else if (tokens[0] === 'create-public') {
            if (tokens.length != 2 && tokens.length != 3) {
                await this.error(requestContext);
                return;
            }

            if (
                Buffer.byteLength(tokens[1], 'utf8') >
                this.constant.card.frontSize
            ) {
                await this.error(requestContext);
                return;
            }

            if (
                (await this.repository.word.getPublicWordByFront(
                    tokens[1],
                    requestContext.poolClient,
                )) !== null
            ) {
                await this.error(requestContext);
                return;
            }

            if (
                requestContext.telegramContext.photo === null &&
                tokens.length === 2
            ) {
                await this.error(requestContext);
                return;
            }

            if (
                requestContext.telegramContext.photo !== null &&
                tokens.length === 3 &&
                tokens[2] !== null &&
                Buffer.byteLength(tokens[2], 'utf8') >
                    this.constant.card.backSizeMedia
            ) {
                await this.error(requestContext);
                return;
            }

            if (
                requestContext.telegramContext.photo === null &&
                tokens.length === 3 &&
                tokens[2] !== null &&
                Buffer.byteLength(tokens[2], 'utf8') >
                    this.constant.card.backSizePlain
            ) {
                await this.error(requestContext);
                return;
            }

            const word = await this.repository.word.createWord(
                tokens[1],
                tokens.length === 2 ? null : tokens[2],
                requestContext.telegramContext.photo,
                'public',
                0,
                requestContext.poolClient,
            );

            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/word-preview',
                {
                    photo: word.media === null ? undefined : word.media,
                    context: { front: word.front, back: word.back },
                },
            );
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'admin/command',
                { context: { scenario: 'done' } },
            );
        } else if (tokens[0] === 'delete-public') {
            if (tokens.length != 2) {
                await this.error(requestContext);
                return;
            }

            if (requestContext.telegramContext.photo !== null) {
                await this.error(requestContext);
                return;
            }

            const word = await this.repository.word.getPublicWordByFront(
                tokens[1],
                requestContext.poolClient,
            );

            if (word === null) {
                await this.error(requestContext);
                return;
            }

            await this.repository.word.deleteWord(
                word.id,
                requestContext.poolClient,
            );
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'admin/command',
                { context: { scenario: 'done' } },
            );
        } else if (tokens[0] === 'modify-public') {
            if (tokens.length != 2 && tokens.length != 3) {
                await this.error(requestContext);
                return;
            }

            const word = await this.repository.word.getPublicWordByFront(
                tokens[1],
                requestContext.poolClient,
            );

            if (word === null) {
                await this.error(requestContext);
                return;
            }

            if (
                requestContext.telegramContext.photo === null &&
                tokens.length === 2
            ) {
                await this.error(requestContext);
                return;
            }

            if (
                requestContext.telegramContext.photo !== null &&
                tokens.length === 3 &&
                tokens[2] !== null &&
                Buffer.byteLength(tokens[2], 'utf8') >
                    this.constant.card.backSizeMedia
            ) {
                await this.error(requestContext);
                return;
            }

            if (
                requestContext.telegramContext.photo === null &&
                tokens.length === 3 &&
                tokens[2] !== null &&
                Buffer.byteLength(tokens[2], 'utf8') >
                    this.constant.card.backSizePlain
            ) {
                await this.error(requestContext);
                return;
            }

            word.front = tokens[1];
            word.back = tokens.length === 2 ? null : tokens[2];
            word.media = requestContext.telegramContext.photo;
            await this.repository.word.updateWord(
                word,
                requestContext.poolClient,
            );

            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/word-preview',
                {
                    photo: word.media === null ? undefined : word.media,
                    context: { front: word.front, back: word.back },
                },
            );
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'admin/command',
                { context: { scenario: 'done' } },
            );
        } else if (tokens[0] === 'publish') {
            if (tokens.length <= 2) {
                await this.error(requestContext);
                return;
            }

            if (requestContext.telegramContext.photo !== null) {
                await this.error(requestContext);
                return;
            }

            let wordSet: Array<Word> = [];

            for (let index = 2; index < tokens.length; index += 1) {
                const word = await this.repository.word.getPublicWordByFront(
                    tokens[index],
                    requestContext.poolClient,
                );
                if (word === null) {
                    await this.error(requestContext);
                    return;
                }

                wordSet.push(word);
            }

            const latestTag = await this.repository.word.getLatestTag(
                requestContext.poolClient,
            );
            for (const word of wordSet) {
                word.tag = latestTag + 1;
                await this.repository.word.updateWord(
                    word,
                    requestContext.poolClient,
                );
            }

            const classroomTid = (
                await this.grammyBot.api.getChat(
                    this.classroomConfig.channelUsername,
                )
            ).id.toString();
            await this.frontend.sendSystemMessage(
                classroomTid,
                'classroom-notes',
                {
                    context: {
                        resource: tokens[1],
                        bot_username: this.botConfig.username.slice(
                            1,
                            this.botConfig.username.length,
                        ),
                        word_set: wordSet,
                    },
                },
            );
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'admin/command',
                { context: { scenario: 'done' } },
            );
        } else {
            await this.error(requestContext);
            return;
        }
    }

    private async error(requestContext: RequestContext) {
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'error' } },
        );
    }

    private parseCommand(command: string | null): Array<string> {
        if (command === null) {
            return [];
        }

        let result: Array<string> = [];
        let current: string | null = null;
        let isMultiLine = false;
        const multiLineBegin = '{';
        const multiLineEnd = '}';

        for (let char of command) {
            if (current === null) {
                if (/\s/.test(char)) {
                    continue;
                } else {
                    if (char === multiLineBegin) {
                        current = '';
                        isMultiLine = true;
                    } else {
                        current = char;
                    }
                }
            } else if (!/\s/.test(char)) {
                if (isMultiLine && char === multiLineEnd) {
                    result.push(current.trim());
                    current = null;
                    isMultiLine = false;
                } else {
                    current += char;
                }
            } else if (!isMultiLine) {
                result.push(current.trim());
                current = null;
                isMultiLine = false;
            } else {
                current += char;
            }
        }

        if (current !== null) {
            result.push(current.trim());
        }

        return result;
    }
}
