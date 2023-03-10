import { cp, writeFile } from 'fs/promises';
import { spawn as baseSpawn, SpawnOptions } from 'child_process';
import { Command, Option, OptionValues } from 'commander';
import { exit } from 'process';

const program = new Command();

const EnvList = ['qa', 'stg', 'prd'] as const;
const NextBuildModeList = ['dev'] as const;

type EnvType = typeof EnvList[number];
type NextBuildMode = typeof NextBuildModeList[number];
interface CustomOptions extends OptionValues {
  env: EnvType;
  nextBuildMode?: NextBuildMode;
}
const envOption = new Option('-e, --env <target>', 'build environment')
  .default('qa', 'QA Server')
  .choices(EnvList);
const nextBuildMode = new Option('--next-build-mode <mode>', 'next.js BUILD_MODE')
  .choices(NextBuildModeList);

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

/**
 * spawn with Promise
 */
// eslint-disable-next-line max-len
const spawn = async (command: string, args: string[] = [], spawnOptions?: SpawnOptions) => new Promise((resolve, reject) => {
  const process = baseSpawn(command, args, {
    ...spawnOptions,
    stdio: 'inherit',
  });

  process.on('close', (code) => { resolve(code); });
  process.on('error', (err) => { reject(err); });
  /* eslint-disable no-console */
  process.stdout?.on('data', (data) => { console.log(data.toString()); });
  process.stderr?.on('data', (data) => { console.log(data.toString()); });
  /* eslint-enable no-console */
});

/**
 * 환경변수 파일 복사
*/
const copyEnvironment = async () => {
  const DEST_FILE_PATH = '.env.local';
  const sourceFilePath = `.env.${TARGET_ENV}`;

  // eslint-disable-next-line no-console
  console.log(`Copy file from ${sourceFilePath} to ${DEST_FILE_PATH}`);

  await cp(sourceFilePath, DEST_FILE_PATH);
};

interface DdTraceEnv {
  service: 'my-service-name',
  env: EnvType;
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
/**
 * Datadog dd-trace 설정을 위한 loader 생성
 */
const createServerPreload = async () => {
  const SERVER_PRELOAD_FILE_NAME = 'server-preload.js';

  // eslint-disable-next-line no-console
  console.log(`Generate ${SERVER_PRELOAD_FILE_NAME} for ${TARGET_ENV}`);

  const target = SERVICE_MAP[TARGET_ENV];
  const contents = `function setupDatadogTracing() {
  const { tracer: Tracer } = require("dd-trace");

  Tracer.init({
    service: "${target.service}",
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
  await writeFile(SERVER_PRELOAD_FILE_NAME, contents, {
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
    copyEnvironment,
    createServerPreload,
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
