module.exports = {
  required: ['role_id','name'],
  properties: {
    role_id: 'number',
    name: 'string',
    phone_number: 'string',
    email: 'string',
    password_hash: 'string',
    is_active: 'boolean'
  }
};
