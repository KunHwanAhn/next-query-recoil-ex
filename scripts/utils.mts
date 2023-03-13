import { cp } from 'fs/promises';
import { spawn as baseSpawn, SpawnOptions } from 'child_process';

const DEST_FILE_PATH = '.env.local';
/**
 * 환경변수 파일 복사
 *
 * @param sourcePath 원본 파일
 * @param destPath 목적 파일
 */
export const copyEnvironment = async (sourcePath: string, destPath: string = DEST_FILE_PATH) => {
  // eslint-disable-next-line no-console
  console.log(`Copy file from ${sourcePath} to ${DEST_FILE_PATH}`);

  await cp(sourcePath, destPath);
};

/**
 * spawn with Promise
 */
// eslint-disable-next-line max-len
export const spawn = async (command: string, args: string[] = [], spawnOptions?: SpawnOptions) => new Promise((resolve, reject) => {
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
