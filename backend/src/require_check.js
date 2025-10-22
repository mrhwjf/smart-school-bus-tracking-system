// Quick require check for new modules
const modules = [
  './routes/index.js',
  './controllers/parentsController.js',
  './services/parentsService.js',
  './repositories/parentsRepository.js',
  './routes/parents.js',
  './controllers/pickupRecordsController.js',
  './services/pickupRecordsService.js',
  './repositories/pickupRecordsRepository.js',
  './routes/pickupRecords.js',
  './controllers/usersController.js',
  './services/usersService.js',
  './repositories/usersRepository.js',
  './routes/users.js',
  './controllers/rolesController.js',
  './services/rolesService.js',
  './repositories/rolesRepository.js',
  './routes/roles.js'
];

for (const m of modules) {
  try {
    require(m);
    console.log('OK', m);
  } catch (err) {
    console.error('ERROR', m, err && err.message);
    process.exit(1);
  }
}
console.log('All modules required successfully');
