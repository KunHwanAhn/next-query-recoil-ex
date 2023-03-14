import { writeFile } from 'fs/promises';
import { SpawnOptions } from 'child_process';
import { Command, Option, OptionValues } from 'commander';
import { exit } from 'process';

import type { EnvType, DdTraceEnv, NextBuildMode } from './types.js';
/* eslint-disable import/extensions */
import { ENV_LIST, NEXT_BUILD_MODEL_LIST } from './constants.mjs';
import { copyEnvironment, spawn } from './utils.mjs';
/* eslint-enable import/extensions */

const program = new Command();

interface CustomOptions extends OptionValues {
  env: EnvType;
  nextBuildMode?: NextBuildMode;
}
const envOption = new Option('-e, --env <target>', 'build environment')
  .default('qa', 'QA Server')
  .choices(ENV_LIST);
const nextBuildMode = new Option('--next-build-mode <mode>', 'next.js BUILD_MODE')
  .choices(NEXT_BUILD_MODEL_LIST);

program
  .addOption(envOption)
  .addOption(nextBuildMode);
program.parse(process.argv);

const options = program.opts<CustomOptions>();
const TARGET_ENV = options.env;
const NEXT_BUILD_MODE = options.nextBuildMode;

// NOTE: prd 환경에서는 NEXT_BUILD_MODE를 사용하지 않음
if (TARGET_ENV === 'prd' && NEXT_BUILD_MODE) {
  // eslint-disable-next-line no-console
  console.error('Error: --next-build-mode can\'t be used with \'--env prd\'');
  exit(1);
}

const SERVICE_MAP: Record<EnvType, DdTraceEnv> = {
  qa: {
    service: 'my-service-name',
    env: 'qa',
  },
  stg: {
    service: 'my-service-name',
    env: 'stg',
  },
  prd: {
    service: 'my-service-name',
    env: 'prd',
  },
};
const SERVER_PRELOAD_FILE_NAME = 'server-preload.js';
/**
 * Datadog dd-trace 설정을 위한 loader 생성
 *
 * {@link https://github.com/vercel/next.js/discussions/16600?sort=top#discussioncomment-1397255 next.js discussions}
 *
 * @param env 타겟 서버
 * @param fileName
 */
const createServerPreload = async (env: EnvType, fileName: string = SERVER_PRELOAD_FILE_NAME) => {
  // eslint-disable-next-line no-console
  console.log(`Generate ${fileName} for ${env}`);

  const target = SERVICE_MAP[env];
  const contents = `function setupDatadogTracing() {
  const { tracer: Tracer } = require("dd-trace");

  Tracer.init({
    // service: "${target.service}",
    // env: "${target.env}",
    service: "my-service-name",
    env: "${target.env}",
    runtimeMetrics: true,
    logInjection: true,
  });
  Tracer.use("next", {
    service: "my-service-name",
  });
}

setupDatadogTracing();
`;
  await writeFile(fileName, contents, {
    encoding: 'utf-8',
    flag: 'w+',
  });
};

/**
 * run next build
 */
const runNextBuild = async () => {
  // eslint-disable-next-line no-console
  console.log('Run next build');

  let spawnOptions: SpawnOptions | undefined;

  if (NEXT_BUILD_MODE) {
    spawnOptions = {
      env: {
        ...process.env,
        BUILD_MODE: NEXT_BUILD_MODE,
      },
    };
  }

  await spawn('next', ['build'], spawnOptions);
};

(async () => {
  const jobQueue = [
    async () => { await copyEnvironment(`.env.${TARGET_ENV}`); },
    async () => { await createServerPreload(TARGET_ENV); },
    runNextBuild,
  ];

  for (let index = 0; index < jobQueue.length; index += 1) {
    /* eslint-disable no-console, no-await-in-loop */
    console.log();
    console.log(`Step ${index + 1}.`);
    await jobQueue[index]();
    /* eslint-enable no-console, no-await-in-loop */
  }
})();
