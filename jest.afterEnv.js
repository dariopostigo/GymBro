/* eslint-env jest */
// Cada test empieza con una base de datos vacía. Lo que un test deje en
// AsyncStorage antes de la primera lectura se migra a SQLite, como en el móvil.
const { resetDbForTests } = require('./src/storage/db');

beforeEach(() => resetDbForTests());
