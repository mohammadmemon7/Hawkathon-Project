// For hackathon MVP purposes, this acts as a mock controller 
// that instantly succeeds so the UI transitions cleanly.

exports.requestCall = (req, res) => {
  const { patient_id, doctor_id, call_type } = req.body;

  if (!patient_id || !doctor_id) {
    return res.status(400).json({ error: 'Patient ID and Doctor ID required' });
  }

  // Simulate a successful connection queue registration
  res.status(200).json({
    message: 'Call requested successfully',
    call_id: `CALL-${Date.now()}`,
    status: 'connecting',
    call_type: call_type || 'video'
  });
};

exports.cancelCall = (req, res) => {
  const { id } = req.params;

  // Simulate cancellation success
  res.status(200).json({
    message: 'Call cancelled successfully',
    call_id: id,
    status: 'cancelled'
  });
};
