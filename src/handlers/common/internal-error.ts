import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class CommonInternalErrorHandler extends Handler {
    public async handle(requestContext: RequestContext) {
        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'word-reminder' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/internal-error',
        );
    }
}
