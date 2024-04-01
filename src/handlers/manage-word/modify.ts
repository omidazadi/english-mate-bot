import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { Word } from '../../database/models/word';
import { Card } from '../../database/models/card';

export class ManageWordModifyHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.telegramContext.photo !== null &&
            requestContext.telegramContext.text !== null &&
            Buffer.byteLength(requestContext.telegramContext.text, 'utf8') >
                this.constant.card.backSizeMedia
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'manage-word/modify',
                { context: { scenario: 'error-invalid-back' } },
            );
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            requestContext.telegramContext.text !== null &&
            Buffer.byteLength(requestContext.telegramContext.text, 'utf8') >
                this.constant.card.backSizePlain
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'manage-word/modify',
                { context: { scenario: 'error-invalid-back' } },
            );
            return;
        }

        let word = (await this.repository.word.getWord(
            requestContext.learner.data.word,
            requestContext.poolClient,
        )) as Word;

        if (word.accessType === 'private') {
            word.back = requestContext.telegramContext.text;
            word.media = requestContext.telegramContext.photo;
            await this.repository.word.updateWord(
                word,
                requestContext.poolClient,
            );
        } else {
            let card = (await this.repository.card.getCardByOwnerAndWord(
                requestContext.learner.id,
                word.id,
                requestContext.poolClient,
            )) as Card;
            await this.repository.card.deleteCard(
                card.owner,
                card.word,
                requestContext.poolClient,
            );
            word = await this.repository.word.createWord(
                word.front,
                requestContext.telegramContext.text,
                requestContext.telegramContext.photo,
                'private',
                requestContext.poolClient,
            );
            card = await this.repository.card.createCard(
                card.owner,
                word.id,
                card.fsrsInfo,
                card.isDue,
                requestContext.poolClient,
            );
        }

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'word-view', word: word.id };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'manage-word/modify',
            {
                photo: word.media === null ? undefined : word.media,
                context: {
                    scenario: 'success',
                    front: word.front,
                    back: word.back,
                },
            },
        );
    }
}
