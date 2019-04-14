import { QueueTypeEnum } from "./enums/queue-type.enum";
import { ActivityType } from "./enums/activity-type.enum";

export default class Helper {
    /**
     * Returns dir name which is YYYY-MM.
     */
    public static GetDateDir(): string {
        const date: Date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${year}-${month}`;
    }

    public static GetDateFileName(): string {
        const date: Date = new Date();
        return `${date.getFullYear}-${date.getMonth() + 1}-${date.getDate()}`;
    }



    /**
     * Transforming from FS path to URL static path.
     * @param path source path to be transformed
     */
    public static transformPathToUrl(path: string): string {
        let src = '';
        if (process.env.PRODUCTION === 'false') {
            src = 'http://localhost:3500/' + 'static/' + path.substring(path.indexOf('public'));
            console.log(process.env.PRODUCTION, src);
        } else {
            src += 'static/' + path.substring(path.indexOf('public'));
            console.log(src);
        }

        return src;
    }

    /**
     * Returns differred elements based only on primitives values.
     */
    public static GetArrayDiff(a: Array<any>, b: Array<any>): Array<any> {
        const diff = [];
        a.forEach(z => {
            if (b.indexOf(z) > -1) {
                diff.push(z);
            }
        });

        return diff;
    }
}

export const flatten = arr => arr.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

/**
 * Returns guid XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
export const newGuid = (): string => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

export const getWSPath = (type: QueueTypeEnum, activityType: ActivityType, id: string) => {
    return `/queue/${QueueTypeEnum[type]}/${ActivityType[activityType]}/${id}`;
};

export const createRoomPath = (id: string) => `/rooms/versus/${id}`;
