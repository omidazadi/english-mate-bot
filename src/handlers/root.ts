import { RequestContext } from '../context/request-context';
import { AddWordRootHandler } from './add-word/root';
import { CommonRootHandler } from './common/root';
import { WordReminderRootHandler } from './word-reminder/root';

export class RootHandler {
    private addWordRootHandler: AddWordRootHandler;
    private wordReminderRootHandler: WordReminderRootHandler;
    private commonRootHandler: CommonRootHandler;

    public constructor(
        addWordRootHandler: AddWordRootHandler,
        wordReminderRootHandler: WordReminderRootHandler,
        commonRootHandler: CommonRootHandler,
    ) {
        this.addWordRootHandler = addWordRootHandler;
        this.wordReminderRootHandler = wordReminderRootHandler;
        this.commonRootHandler = commonRootHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        const splittedPath = path.split('/');
        const nextPath = splittedPath.slice(1, splittedPath.length).join('/');
        if (splittedPath[0] === 'add-word') {
            await this.addWordRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'word-reminder') {
            await this.wordReminderRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'common') {
            await this.commonRootHandler.handle(nextPath, requestContext);
        }
    }
}
