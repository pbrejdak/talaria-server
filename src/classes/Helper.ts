
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
     * Returns guid XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    public static NewGuid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
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

export const newGuid = (): string => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};
//     "@types/node": "^6.0.77",
