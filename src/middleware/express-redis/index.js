/**
 * @file Conexão com o Redis
 * @author douglaspands
 * @since 2018-09-03
 * @version 1.1.20180917
 */
'use strict';
const redis = require('redis');
const Cache = require('./Cache');
const source = (__dirname).split('/').pop();
const utils = require('../utils');
const config = utils.getYaml('config.yaml');
const [REDIS_HOST, REDIS_PORT] = (process.env.REDIS_URL || config.uri).split(':');
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

/**
 * Obter conexão com o Redis
 * @param {object} app Servidor Express.
 */
module.exports = app => {

    const logger = app.get('logger');

    /**
     * Criando conexão.
     */
    const redisConfig = {
        host: REDIS_HOST,
        port: REDIS_PORT,
        detect_buffers: true
    };
    const client = redis.createClient(redisConfig);
    app.set('redis', client);
    app.set('redis-config', redisConfig);
    app.set('cache', new Cache(client, config, logger));
    /**
     * Em caso de erro no acesso ao Redis.
     */
    client.on("error", error => {
        logger.warn({
            source: source,
            message: error
        });
    });

    /**
     * Em caso de conexão com sucesso.
     */
    client.on("connect", () => {
        logger.info({
            source: source,
            message: `Redis ativado com sucesso na url: ${REDIS_URL}`
        });
    });
    return client;
}
