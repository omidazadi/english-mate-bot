import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class SettingsNavigateToSettingsHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'settings' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'settings/navigate-to-settings',
            { context: { learner: learner } },
        );
    }
}
