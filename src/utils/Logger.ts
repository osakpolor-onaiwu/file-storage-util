import mlite from 'mlite';
import config from '../config/index';

/**
 * Describes methods required for any custom logger
 */
export interface MLogger {
  log(data: any, optional_key?: string, type?: string): any;
  info(data: any, optional_key?: string): any;
  warning(data: any, optional_key?: string): any;
  error(data: any, optional_key?: string): any;
  errorX(data: any, optional_key?: string): any;
}

const Logger: MLogger = mlite(config.mlite_token);

export default Logger;