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
            await this.versionCommand(tokens, requestContext);
        } else if (tokens[0] === 'create-public') {
            await this.createPublicCommand(tokens, requestContext);
        } else if (tokens[0] === 'delete-public') {
            await this.deletePublicCommand(tokens, requestContext);
        } else if (tokens[0] === 'modify-public') {
            await this.modifyPublicCommand(tokens, requestContext);
        } else if (tokens[0] === 'show-public') {
            await this.showPublicCommand(tokens, requestContext);
        } else if (tokens[0] === 'publish') {
            await this.publishCommand(tokens, requestContext);
        } else if (tokens[0] === 'create-deck') {
            await this.createDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'delete-deck') {
            await this.deleteDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'modify-deck') {
            await this.modifyDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'show-deck') {
            await this.showDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'online-deck') {
            await this.onlineDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'offline-deck') {
            await this.offlineDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'set-example-deck') {
            await this.setExampleDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'grant-deck') {
            await this.grantDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'deny-deck') {
            await this.denyDeckCommand(tokens, requestContext);
        } else if (tokens[0] === 'deck-size') {
            await this.deckSizeCommand(tokens, requestContext);
        } else if (tokens[0] === 'create-paid') {
            await this.createPaidCommand(tokens, requestContext);
        } else if (tokens[0] === 'delete-paid') {
            await this.deletePaidCommand(tokens, requestContext);
        } else if (tokens[0] === 'modify-paid') {
            await this.modifyPaidCommand(tokens, requestContext);
        } else if (tokens[0] === 'show-paid') {
            await this.showPaidCommand(tokens, requestContext);
        } else {
            await this.error(requestContext);
        }
    }

    private async error(requestContext: RequestContext) {
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'error' } },
        );
    }

    private async versionCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 1) {
            await this.error(requestContext);
            return;
        }

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            {
                context: {
                    scenario: 'plain',
                    message: this.botConfig.version,
                },
            },
        );
    }

    private async createPublicCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2 && tokens.length != 3) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[1], 'utf8') > this.constant.card.frontSize
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
            Buffer.byteLength(tokens[2], 'utf8') >
                this.constant.card.backSizeMedia
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            tokens.length === 3 &&
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
            null,
            requestContext.poolClient,
        );

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo: word.media === null ? undefined : word.media,
                context: { word: word },
            },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async deletePublicCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
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
    }

    private async modifyPublicCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
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
            Buffer.byteLength(tokens[2], 'utf8') >
                this.constant.card.backSizeMedia
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            tokens.length === 3 &&
            Buffer.byteLength(tokens[2], 'utf8') >
                this.constant.card.backSizePlain
        ) {
            await this.error(requestContext);
            return;
        }

        word.front = tokens[1];
        word.back = tokens.length === 2 ? null : tokens[2];
        word.media = requestContext.telegramContext.photo;
        await this.repository.word.updateWord(word, requestContext.poolClient);

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo: word.media === null ? undefined : word.media,
                context: { word: word },
            },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async showPublicCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2) {
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

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo: word.media === null ? undefined : word.media,
                context: { word: word },
            },
        );
    }

    private async publishCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
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
        await this.frontend.sendSystemMessage(classroomTid, 'classroom-notes', {
            context: {
                resource: tokens[1],
                bot_username: this.botConfig.username.slice(
                    1,
                    this.botConfig.username.length,
                ),
                word_set: wordSet,
            },
        });
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async createDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 6) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[1], 'utf8') > this.constant.deck.nameSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[2], 'utf8') >
            this.constant.deck.fullNameSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[3], 'utf8') >
            this.constant.deck.descriptionSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[4], 'utf8') > this.constant.deck.levelSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (isNaN(parseInt(tokens[5]))) {
            await this.error(requestContext);
            return;
        }

        let deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck !== null) {
            await this.error(requestContext);
            return;
        }

        deck = await this.repository.deck.getDeckByFullName(
            tokens[2],
            requestContext.poolClient,
        );

        if (deck !== null) {
            await this.error(requestContext);
            return;
        }

        deck = await this.repository.deck.createDeck(
            tokens[1],
            tokens[2],
            tokens[3],
            null,
            'offline',
            tokens[4],
            parseInt(tokens[5]),
            requestContext.poolClient,
        );

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/deck-preview',
            { context: { deck: deck } },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async deleteDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        await this.repository.deck.deleteDeck(
            deck.name,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async modifyDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 6) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        let deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[2], 'utf8') >
            this.constant.deck.fullNameSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[3], 'utf8') >
            this.constant.deck.descriptionSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            Buffer.byteLength(tokens[4], 'utf8') > this.constant.deck.levelSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (isNaN(parseInt(tokens[5]))) {
            await this.error(requestContext);
            return;
        }

        const tempDeck = await this.repository.deck.getDeckByFullName(
            tokens[2],
            requestContext.poolClient,
        );
        if (tempDeck !== null && tempDeck.name !== deck.name) {
            await this.error(requestContext);
            return;
        }

        deck.fullName = tokens[2];
        deck.description = tokens[3];
        deck.level = tokens[4];
        deck.price = parseInt(tokens[5]);
        await this.repository.deck.updateDeck(deck, requestContext.poolClient);

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/deck-preview',
            { context: { deck: deck } },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async showDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        let deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/deck-preview',
            { context: { deck: deck } },
        );
    }

    private async onlineDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        deck.status = 'online';
        await this.repository.deck.updateDeck(deck, requestContext.poolClient);

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async offlineDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        deck.status = 'offline';
        await this.repository.deck.updateDeck(deck, requestContext.poolClient);

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async setExampleDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2 && tokens.length != 3) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        if (tokens.length === 3) {
            const premiumName = `[${deck.name}] ${tokens[2]}`;
            const word = await this.repository.word.getPaidWordByFront(
                deck.name,
                premiumName,
                requestContext.poolClient,
            );

            if (word === null) {
                await this.error(requestContext);
                return;
            }

            deck.exampleWord = word.id;
        } else {
            deck.exampleWord = null;
        }

        await this.repository.deck.updateDeck(deck, requestContext.poolClient);

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async grantDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 3) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        const learner = await this.repository.learner.getLearnerByTid(
            tokens[2],
            requestContext.poolClient,
        );

        if (learner === null) {
            await this.error(requestContext);
            return;
        }

        await this.repository.card.grantDeckCardsToLearner(
            learner.id,
            deck.name,
            requestContext.poolClient,
        );

        await this.frontend.sendSystemMessage(learner.tid, 'deck-granted', {
            context: { deck: deck.name },
        });
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async denyDeckCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 3) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        const learner = await this.repository.learner.getLearnerByTid(
            tokens[2],
            requestContext.poolClient,
        );

        if (learner === null) {
            await this.error(requestContext);
            return;
        }

        await this.repository.card.denyDeckCardsFromLearner(
            learner.id,
            deck.name,
            requestContext.poolClient,
        );

        await this.frontend.sendSystemMessage(learner.tid, 'deck-denied', {
            context: { deck: deck.name },
        });
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async deckSizeCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 2) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        const noWords = await this.repository.word.getNoPaidWords(
            deck.name,
            requestContext.poolClient,
        );

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'plain', message: noWords } },
        );
    }

    private async createPaidCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 3 && tokens.length != 4) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        const premiumName = `[${deck.name}] ${tokens[2]}`;

        if (
            Buffer.byteLength(premiumName, 'utf8') >
            this.constant.card.frontSize
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            (await this.repository.word.getPaidWordByFront(
                deck.name,
                premiumName,
                requestContext.poolClient,
            )) !== null
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            tokens.length === 3
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo !== null &&
            tokens.length === 4 &&
            Buffer.byteLength(tokens[3], 'utf8') >
                this.constant.card.backSizeMedia
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            tokens.length === 4 &&
            Buffer.byteLength(tokens[3], 'utf8') >
                this.constant.card.backSizePlain
        ) {
            await this.error(requestContext);
            return;
        }

        const word = await this.repository.word.createWord(
            premiumName,
            tokens.length === 3 ? null : tokens[3],
            requestContext.telegramContext.photo,
            'paid',
            0,
            deck.name,
            requestContext.poolClient,
        );

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo: word.media === null ? undefined : word.media,
                context: { word: word },
            },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async deletePaidCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 3) {
            await this.error(requestContext);
            return;
        }

        if (requestContext.telegramContext.photo !== null) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        const premiumName = `[${deck.name}] ${tokens[2]}`;
        const word = await this.repository.word.getPaidWordByFront(
            deck.name,
            premiumName,
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
    }

    private async modifyPaidCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 3 && tokens.length != 4) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        const premiumName = `[${deck.name}] ${tokens[2]}`;
        const word = await this.repository.word.getPaidWordByFront(
            deck.name,
            premiumName,
            requestContext.poolClient,
        );

        if (word === null) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            tokens.length === 3
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo !== null &&
            tokens.length === 4 &&
            Buffer.byteLength(tokens[3], 'utf8') >
                this.constant.card.backSizeMedia
        ) {
            await this.error(requestContext);
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            tokens.length === 4 &&
            Buffer.byteLength(tokens[3], 'utf8') >
                this.constant.card.backSizePlain
        ) {
            await this.error(requestContext);
            return;
        }

        word.front = premiumName;
        word.back = tokens.length === 3 ? null : tokens[3];
        word.media = requestContext.telegramContext.photo;
        await this.repository.word.updateWord(word, requestContext.poolClient);

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo: word.media === null ? undefined : word.media,
                context: { word: word },
            },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/command',
            { context: { scenario: 'done' } },
        );
    }

    private async showPaidCommand(
        tokens: Array<string>,
        requestContext: RequestContext,
    ): Promise<void> {
        if (tokens.length != 3) {
            await this.error(requestContext);
            return;
        }

        const deck = await this.repository.deck.getDeck(
            tokens[1],
            requestContext.poolClient,
        );

        if (deck === null) {
            await this.error(requestContext);
            return;
        }

        const premiumName = `[${deck.name}] ${tokens[2]}`;
        const word = await this.repository.word.getPaidWordByFront(
            deck.name,
            premiumName,
            requestContext.poolClient,
        );

        if (word === null) {
            await this.error(requestContext);
            return;
        }

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo: word.media === null ? undefined : word.media,
                context: { word: word },
            },
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

        if (current !== null && !isMultiLine) {
            result.push(current.trim());
        }

        return result;
    }
}
