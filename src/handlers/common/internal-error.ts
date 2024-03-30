import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class CommonInternalErrorHandler extends Handler {
    public async handle(requestContext: RequestContext) {
        await this.frontend.sendActionMessage(
            requestContext.user.tid,
            'common/internal-error',
        );
    }
}
