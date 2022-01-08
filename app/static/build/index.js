'use strict';

const Hapi = require('@hapi/hapi');
const Path = require('path');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        // routes: {
        //     files: {
        //         relativeTo: Path.join(__dirname, 'public')
        //     }
        // }
    });

    await server.register(require('@hapi/inert'));

    server.route({
        method: 'GET',
        path: '/hello-world',
        handler: (request, h) => {

            return 'Hello World!';
        }
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                index: ['index.html']
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
