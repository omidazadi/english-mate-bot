import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class AdminNavigateInHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (requestContext.telegramContext.isOwner === false) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/unknown',
            );
            return;
        }

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'cli' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'admin/navigate-in',
        );
    }
}
