// Mock dotenv config
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Data Source Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to get fresh import
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to get AppDataSource with proper typing
  const getAppDataSource = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./data-source').AppDataSource;
  };

  it('should create DataSource with environment variables', async () => {
    // Mock process.env
    process.env.DATABASE_HOST = 'test-host';
    process.env.DATABASE_PORT = '5433';
    process.env.DATABASE_USERNAME = 'test-user';
    process.env.DATABASE_PASSWORD = 'test-pass';
    process.env.DATABASE_NAME = 'test-db';
    process.env.NODE_ENV = 'development'; // Set for logging test

    // Import data source
    const AppDataSource = getAppDataSource();

    // Verify DataSource is created
    expect(AppDataSource).toBeDefined();
    expect(AppDataSource.options).toMatchObject({
      type: 'postgres',
      host: 'test-host',
      port: 5433,
      username: 'test-user',
      password: 'test-pass',
      database: 'test-db',
      entities: ['src/database/entities/*.entity.ts'],
      migrations: ['src/database/migrations/*.ts'],
      synchronize: false,
      logging: true,
    });
  });

  it('should create DataSource with default values when env vars are not set', () => {
    // Clear environment variables
    delete process.env.DATABASE_HOST;
    delete process.env.DATABASE_PORT;
    delete process.env.DATABASE_USERNAME;
    delete process.env.DATABASE_PASSWORD;
    delete process.env.DATABASE_NAME;
    process.env.NODE_ENV = 'development'; // Set for logging test

    // Import data source
    const AppDataSource = getAppDataSource();

    // Verify DataSource is created with defaults
    expect(AppDataSource).toBeDefined();
    expect(AppDataSource.options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'brainag_user',
      password: 'brainag_pass',
      database: 'brainag_db',
      entities: ['src/database/entities/*.entity.ts'],
      migrations: ['src/database/migrations/*.ts'],
      synchronize: false,
      logging: true,
    });
  });

  it('should handle invalid port number gracefully', () => {
    // Set invalid port
    process.env.DATABASE_PORT = 'invalid-port';

    // Import data source
    const AppDataSource = getAppDataSource();

    // Verify DataSource uses default port for invalid value
    expect(AppDataSource.options.port).toBe(5432);
  });

  it('should have correct configuration structure', () => {
    process.env.NODE_ENV = 'development'; // Set for logging test

    // Import data source
    const AppDataSource = getAppDataSource();

    // Verify all required configuration properties
    expect(AppDataSource.options).toHaveProperty('type', 'postgres');
    expect(AppDataSource.options).toHaveProperty('host');
    expect(AppDataSource.options).toHaveProperty('port');
    expect(AppDataSource.options).toHaveProperty('username');
    expect(AppDataSource.options).toHaveProperty('password');
    expect(AppDataSource.options).toHaveProperty('database');
    expect(AppDataSource.options).toHaveProperty('entities');
    expect(AppDataSource.options).toHaveProperty('migrations');
    expect(AppDataSource.options).toHaveProperty('synchronize', false);
    expect(AppDataSource.options).toHaveProperty('logging', true);
  });

  it('should have entities configuration', () => {
    // Import data source
    const AppDataSource = getAppDataSource();

    // Verify entities configuration
    expect(Array.isArray(AppDataSource.options.entities)).toBe(true);
    expect(AppDataSource.options.entities).toContain('src/database/entities/*.entity.ts');
  });

  it('should have migrations configuration', () => {
    // Import data source
    const AppDataSource = getAppDataSource();

    // Verify migrations configuration
    expect(Array.isArray(AppDataSource.options.migrations)).toBe(true);
    expect(AppDataSource.options.migrations).toContain('src/database/migrations/*.ts');
  });

  it('should create DataSource instance', () => {
    // Import data source
    const AppDataSource = getAppDataSource();

    // Verify it's a DataSource instance
    expect(AppDataSource.constructor.name).toBe('DataSource');
    expect(typeof AppDataSource.initialize).toBe('function');
    expect(typeof AppDataSource.destroy).toBe('function');
  });
});
