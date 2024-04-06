import { RequestContext } from '../context/request-context';
import { AddWordRootHandler } from './add-word/root';
import { AdminRootHandler } from './admin/root';
import { CommonRootHandler } from './common/root';
import { ManageWordRootHandler } from './manage-word/root';
import { PremiumRootHandler } from './premium/root';
import { ReviewWordRootHandler } from './review-word/root';
import { WordReminderRootHandler } from './word-reminder/root';

export class RootHandler {
    private reviewWordRootHandler: ReviewWordRootHandler;
    private addWordRootHandler: AddWordRootHandler;
    private wordReminderRootHandler: WordReminderRootHandler;
    private manageWordRootHandler: ManageWordRootHandler;
    private adminRootHandler: AdminRootHandler;
    private premiumRootHandler: PremiumRootHandler;
    private commonRootHandler: CommonRootHandler;

    public constructor(
        reviewWordRootHandler: ReviewWordRootHandler,
        addWordRootHandler: AddWordRootHandler,
        wordReminderRootHandler: WordReminderRootHandler,
        manageWordRootHandler: ManageWordRootHandler,
        adminRootHandler: AdminRootHandler,
        premiumRootHandler: PremiumRootHandler,
        commonRootHandler: CommonRootHandler,
    ) {
        this.reviewWordRootHandler = reviewWordRootHandler;
        this.addWordRootHandler = addWordRootHandler;
        this.wordReminderRootHandler = wordReminderRootHandler;
        this.manageWordRootHandler = manageWordRootHandler;
        this.adminRootHandler = adminRootHandler;
        this.premiumRootHandler = premiumRootHandler;
        this.commonRootHandler = commonRootHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        const splittedPath = path.split('/');
        const nextPath = splittedPath.slice(1, splittedPath.length).join('/');
        if (splittedPath[0] === 'review-word') {
            await this.reviewWordRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'add-word') {
            await this.addWordRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'word-reminder') {
            await this.wordReminderRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'manage-word') {
            await this.manageWordRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'admin') {
            await this.adminRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'premium') {
            await this.premiumRootHandler.handle(nextPath, requestContext);
        } else if (splittedPath[0] === 'common') {
            await this.commonRootHandler.handle(nextPath, requestContext);
        }
    }
}
