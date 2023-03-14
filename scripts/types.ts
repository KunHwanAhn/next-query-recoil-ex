// eslint-disable-next-line import/extensions
import { ENV_LIST, NEXT_BUILD_MODEL_LIST } from './constants.mjs';

export type EnvType = typeof ENV_LIST[number];
export type NextBuildMode = typeof NEXT_BUILD_MODEL_LIST[number];
export interface DdTraceEnv {
  service: 'my-service-name',
  env: EnvType;
}
