module.exports = {
  required: ['student_id','stop_id'],
  properties: {
    student_id: 'number',
    stop_id: 'number',
    status: ['PICKED_UP','DROPPED_OFF','MISSED','WAITING'],
    recorded_at: 'string'
  }
};
