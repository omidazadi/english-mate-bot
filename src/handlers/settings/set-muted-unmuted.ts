import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { Repository } from '../../database/repositories/repository';
import { Frontend } from '../../frontend';
import { Constant } from '../../constants/constant';

export class SettingsSetMutedUnmutedHandler extends Handler {
    private buttonTexts: any;

    public constructor(
        repository: Repository,
        frontend: Frontend,
        constant: Constant,
        buttonTexts: any,
    ) {
        super(repository, frontend, constant);
        this.buttonTexts = buttonTexts;
    }

    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            (requestContext.learner.isMuted === true &&
                requestContext.telegramContext.text ===
                    this.buttonTexts.state.settings.mute) ||
            (requestContext.learner.isMuted === false &&
                requestContext.telegramContext.text ===
                    this.buttonTexts.state.settings.unmute)
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/unknown',
            );
            return;
        }

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'settings' };
        learner.isMuted =
            requestContext.telegramContext.text ===
            this.buttonTexts.state.settings.unmute
                ? false
                : true;
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'settings/set-muted-unmuted',
            { context: { learner: learner } },
        );
    }
}
