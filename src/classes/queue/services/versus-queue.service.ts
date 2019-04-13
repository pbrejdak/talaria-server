import { VersusQueue } from "../versus.queue";
import { IUser } from "../../../models/user.model";
import { SignUpVersusRequest } from "../../contracts/signUpVersusRequest";
import { ActivityType } from "../../enums/activity-type.enum";

export class VersusQueueService {
    private static _instance: VersusQueueService;

    private queueSockets: Map<ActivityType, Map<string, VersusQueue>> = new Map<ActivityType, Map<string, VersusQueue>>();

    static get instance(): VersusQueueService {
        return VersusQueueService._instance;
    }

    static createInstance() {
        if (VersusQueueService._instance) {
            console.warn("WARNING. VersusQueueService is already created.");
            return VersusQueueService._instance;
        } else {
            VersusQueueService._instance = new VersusQueueService();
        }
    }

    /**
     * Key - user range rank e.g. 0-50
     * Value - queue
     */

    constructor() { }

    private getUserRange(rep: number): string {
        if (rep <= 50) {
            return "0-50";
        }
        return "0-50";
    }

    private getQueue(activityType: ActivityType, reputation: number) {
        const range = this.getUserRange(reputation);
        if (!this.queueSockets.has(activityType)) {
            const map = new Map<string, VersusQueue>();
            map.set(range, new VersusQueue(activityType, range));

            this.queueSockets.set(activityType, map);
            return map.get(range);
        }

        if (!this.queueSockets.get(activityType).has(range)) {
            this.queueSockets.get(activityType).set(range, new VersusQueue(activityType, range));
        }

        return this.queueSockets.get(activityType).get(range);
    }

    addToQueue(user: IUser, versus: SignUpVersusRequest): Promise<string> {
        return new Promise((resolve, reject) => {
            const queue = this.getQueue(versus.activityType, user.reputation);

            resolve(queue.wsPath);
        });
    }


}
