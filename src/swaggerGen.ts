const host = `http://${process.env.IP}:${process.env.PORT}`;

module.exports = {
    info: {
        title: `${process.env.APP_NAME}`,
        version: '1.0.0',
        description: `
API for ${process.env.APP_NAME}

    To use CRUD api call <server_adrress>:<port>/v1/<category>/<route> with PUT/GET/PATCH/DELETE methods.
    For example: PUT ${host}/v1/user/auth - to insert new cardTemplate.
        `
    },
    host: host,
    basePath: '/v1/',
    apis: [
        // files that swagger-codegen will scan for annotation.
        './routers/BaseRoute.js',
        './routers/**/*.router.js',
        './models/**/*.model.js'
    ]
};

export interface ISwaggerOptions {
    swaggerDefinition: ISwaggerDefinition;
    apis: string[];
}

export interface ISwaggerInfo {
    title: string;
    version: string;
    description: string;
}

export interface ISwaggerDefinition {
    info: ISwaggerInfo;
    host?: string;
    basePath?: string;
}
