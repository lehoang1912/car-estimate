var dbConfig = {
  synchronize: false,
  migrations: ['migration/*.js'],
  cli: {
    migrationsDir: 'migration',
  },
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['**/*.entity.js'], // this config is add after compiling ts to js. so enities should be from dist/*.entity.js
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'], // App Module is js-jet only run ts files
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      migrationsRun: true,
      entities: ['**/*.entity.js'], // App Module is js-jet only run ts files
      ssl: {
        rejectUnauthorized: false,
      },
    });
    break;
  default:
    throw new Error('Unknown environment');
}

module.exports = dbConfig;
