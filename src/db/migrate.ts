import { logger } from '../server/units/logger';
import { runMigration } from './utils';

runMigration();
logger.info('Migration is completed');
