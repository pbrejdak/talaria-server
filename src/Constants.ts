export default class Constants {
    static EmailRegExp: RegExp = /\S+@\S+\.\S+/;
    static CERTIFICATE_PATHS = `.____CFPH`;
}

export enum TokenExpiration {
    WEEK = 604800,
    HOUR = 3600000
}

export const allowedExt: string[] = [
    '.js',
    '.ico',
    '.css',
    '.png',
    '.jpg',
    '.woff2',
    '.woff',
    '.ttf',
    '.svg',
];

export const mongooseObjectId = "ObjectId";
