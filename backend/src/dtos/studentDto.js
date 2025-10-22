// Minimal student DTO description (used for documentation / future validation)
// Fields: parent_id (int), name (string), class (string), gender (MALE|FEMALE|OTHER), date_of_birth (YYYY-MM-DD)
module.exports = {
  required: ['parent_id', 'name'],
  properties: {
    parent_id: 'number',
    name: 'string',
    class: 'string',
    gender: ['MALE', 'FEMALE', 'OTHER'],
    date_of_birth: 'string'
  }
};
