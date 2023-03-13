import { SpawnOptions } from 'child_process';

// eslint-disable-next-line import/extensions
import { copyEnvironment, spawn } from './utils.mjs';
import type { EnvType, NextBuildMode } from './types.js';

const TARGET_ENV: EnvType = 'qa';
const BUILD_MODE: NextBuildMode = 'dev';

const runNextDev = async () => {
  // eslint-disable-next-line no-console
  console.log('Run next dev');

  const spawnOptions: SpawnOptions = {
    env: {
      ...process.env,
      BUILD_MODE,
    },
  };

  await spawn('next', ['dev'], spawnOptions);
};

(async () => {
  const jobQueue = [
    async () => { await copyEnvironment(`.env.${TARGET_ENV}`); },
    runNextDev,
  ];

  for (let index = 0; index < jobQueue.length; index += 1) {
    /* eslint-disable no-console, no-await-in-loop */
    console.log();
    console.log(`Step ${index + 1}.`);
    await jobQueue[index]();
    /* eslint-enable no-console, no-await-in-loop */
  }
})();
