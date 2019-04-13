import { ActivityType } from "../enums/activity-type.enum";
import { EnvironmentType } from "../enums/environment-type.enum";

export interface SignUpVersusRequest {
    activityType: ActivityType;
    environmentType: EnvironmentType;
    distance: number;
}
