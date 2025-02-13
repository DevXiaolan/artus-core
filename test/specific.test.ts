import 'reflect-metadata';
import { Scanner } from '../src/scanner';
import path from 'path';
import axios from 'axios';
import assert from 'assert';
import fs from 'fs';
import { ARTUS_SERVER_ENV } from '../src/constant';

describe('test/specific.test.ts', () => {
  describe('run with scanner framework', () => {
    beforeEach(async function () {
      process.env[ARTUS_SERVER_ENV] = 'private';
    });

    afterEach(async function () {
      process.env[ARTUS_SERVER_ENV] = undefined;
    });

    it('should run succeed', async () => {
      const scanner = new Scanner({
        needWriteFile: false, extensions: ['.ts', '.js', '.json'],
        configDir: 'src/config',
        envs: ['private'],
        framework: { path: path.join(__dirname, 'fixtures/frameworks/bar') },
        plugin: {
          mysql: {
            path: path.join(__dirname, 'fixtures/application_specific/src/plugins/artus_plugin_mysql_ob'),
          },
          redis: {
            enable: false,
          },
        },
      });
      const { private: manifest } = await scanner.scan(path.resolve(__dirname, './fixtures/application_specific'));
      // console.log('manifest', manifest);
      const { main } = await import('./fixtures/application_specific/src');
      const app = await main(manifest);
      assert(app.isListening());
      const port = app.artus.config?.port;
      assert(port === 3003);
      const testResponse = await axios.get(`http://127.0.0.1:${port}/home`);
      assert(testResponse.status === 200);
      assert(testResponse.data.title === 'Hello Artus from application <private>');

      //  check config loaded succeed
      const testResponseConfig = await axios.get(`http://127.0.0.1:${port}/config`);
      assert(testResponseConfig.status === 200);
      assert(testResponseConfig.data.message === 'get conifg succeed');

      // check frameworke used as env
      const testResponseName2 = await axios.get(`http://127.0.0.1:${port}/get_name2`);
      assert(testResponseName2.data.title === 'Hello Artus [name2] from framework: foo2 [default]');
      const testResponseName3 = await axios.get(`http://127.0.0.1:${port}/get_name3`);
      assert(testResponseName3.data.title === 'Hello Artus [name3] from framework: foo2 [private]');

      // check plugin
      const testResponseName4 = await axios.get(`http://127.0.0.1:${port}/plugin-mysql`);
      assert(testResponseName4.data.client === 'mysql-ob');
      const testResponseName5 = await axios.get(`http://127.0.0.1:${port}/plugin-redis`);
      assert(testResponseName5.data.message === 'plugin redis not enabled');

      await app.artus.close();
      assert(!app.isListening());
    });
  });

  describe('run with user framework', () => {
    const userConfigPath = path.join(__dirname, 'fixtures/application_specific/src/config/framework.ts');
    const userConfig = {
      path: path.join(__dirname, 'fixtures/frameworks/bar'),
    };

    beforeEach(async function () {
      process.env[ARTUS_SERVER_ENV] = 'private';
      // mock user config
      fs.writeFileSync(userConfigPath, `export default ${JSON.stringify(userConfig)}`);
    });

    afterEach(async function () {
      process.env[ARTUS_SERVER_ENV] = undefined;
      // remove user config
      fs.unlinkSync(userConfigPath);
    });

    it('should run succeed ', async () => {
      const scanner = new Scanner({
        needWriteFile: false, extensions: ['.ts', '.js', '.json'],
        configDir: 'src/config',
        envs: ['private'],
        framework: { path: path.join(__dirname, 'fixtures/frameworks/bar2') },
        plugin: {
          mysql: {
            path: path.join(__dirname, 'fixtures/application_specific/src/plugins/artus_plugin_mysql_ob'),
          },
          redis: {
            enable: false,
          },
        },
      });
      const { private: manifest } = await scanner.scan(path.resolve(__dirname, './fixtures/application_specific'));
      // console.log('manifest', manifest);
      const { main } = await import('./fixtures/application_specific/src');
      const app = await main(manifest);
      assert(app.isListening());
      const port = app.artus.config?.port;
      assert(port === 3003);
      const testResponse = await axios.get(`http://127.0.0.1:${port}/home`);
      assert(testResponse.status === 200);
      assert(testResponse.data.title === 'Hello Artus from application <private>');

      //  check config loaded succeed
      const testResponseConfig = await axios.get(`http://127.0.0.1:${port}/config`);
      assert(testResponseConfig.status === 200);
      assert(testResponseConfig.data.message === 'get conifg succeed');

      // check frameworke used as env
      const testResponseName2 = await axios.get(`http://127.0.0.1:${port}/get_name2`);
      assert(testResponseName2.data.title === 'Hello Artus [name2] from framework: foo2 [default]');
      const testResponseName3 = await axios.get(`http://127.0.0.1:${port}/get_name3`);
      assert(testResponseName3.data.title === 'Hello Artus [name3] from framework: foo2 [private]');

      // check plugin
      const testResponseName4 = await axios.get(`http://127.0.0.1:${port}/plugin-mysql`);
      assert(testResponseName4.data.client === 'mysql-ob');
      const testResponseName5 = await axios.get(`http://127.0.0.1:${port}/plugin-redis`);
      assert(testResponseName5.data.message === 'plugin redis not enabled');

      await app.artus.close();
      assert(!app.isListening());
    });
  });
});
