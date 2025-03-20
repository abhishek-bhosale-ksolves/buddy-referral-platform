const Referral = require('../models/Referral');
const AsyncHandler = require('express-async-handler');

// Create new referral
const createReferral = AsyncHandler(async (req, res) => {
  try {
    const { 
      candidateName, 
      candidateEmail, 
      candidatePhone, 
      resumeUrl, 
      position, 
      experience,
    } = req.body;
    
    const referral = await Referral.create({
      candidateName,
      candidateEmail,
      candidatePhone,
      resumeUrl,
      position,
      experience,
      referredBy: req.user.id
    });
    
    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all referrals (HR can see all, employees see only their own)
const getReferrals = AsyncHandler(async (req, res) => {
    console.log("**********")
    console.log(req.user);
  try {
    
    // Filter by user role (HR sees all, employees see only their own)
    if (req.user.role !== 'hr') {
        const referrals = await Referral.find({ referredBy: req.user.id });
        return res.status(200).json(referrals);
    }
    else {
        const referrals = await Referral.find({});
        return res.status(200).json(referrals);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get referral by ID
const getReferralById = AsyncHandler(async (req, res) => {
  try {
    if(req.user.role === 'hr') {
        const referral = await Referral.findById(req.params.id);
        if (referral.length === 0) {
          return res.status(404).json({ message: 'Referral not found' });
        }
        return res.status(200).json(referral);
    }
    const referral = await Referral.find({ _id: req.params.id, referredBy: req.user.id });
    console.log(referral);
    if (referral.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    return res.status(200).json(referral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update referral status
const updateReferralStatus = AsyncHandler(async (req, res) => {
  try {
    const allowedStatus = ['submitted', 'screening', 'interviewing', 'offered', 'hired', 'rejected'];
    const { status} = req.body;
    if(!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Allowed values are: submitted, screening, interviewing, offered, hired, rejected' });
    }
    
    const referral = await Referral.find({_id: req.params.id});
    
    if (referral.length===0) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Only HR can update status (or the original referrer if still in 'submitted' state)
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Not authorized to update this referral' });
    }

    await Referral.findByIdAndUpdate(req.params.id, { status: status, lastUpdated: Date.now() });
    
    res.json(await Referral.findById(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update referral details
const updateReferral = AsyncHandler(async (req, res) => {
  try {
    const referral = await Referral.findById({_id: req.params.id, referredBy: req.user.id});
    
    if (referral.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Update only allowed fields
    const { 
      candidateName, 
      candidateEmail, 
      candidatePhone, 
      position, 
      experience,
    } = req.body;
    
    if (candidateName) referral.candidateName = candidateName;
    if (candidateEmail) referral.candidateEmail = candidateEmail;
    if (candidatePhone) referral.candidatePhone = candidatePhone;
    if (position) referral.position = position;
    if (experience) referral.experience = experience;
    
    await Referral.findByIdAndUpdate(req.params.id, referral);
    
    res.json(await Referral.findById(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete referral
const deleteReferral = AsyncHandler(async (req, res) => {
  try {
    const referral = await Referral.findById({_id: req.params.id, referredBy: req.user.id});

    console.log(referral);
    console.log(referral.referredBy.toString());
    
    if (referral.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Check if user has permission to delete this referral
    if (req.user.id !== referral.referredBy.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this referral' });
    }
    
    await Referral.findByIdAndDelete(req.params.id);
    res.json({ message: 'Referral removed', deletedReferral: referral });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createReferral,
  getReferrals,
  getReferralById,
  updateReferralStatus,
  updateReferral,
  deleteReferral
};