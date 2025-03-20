const express = require('express');
const router = express.Router();
const {createReferral, getReferrals, getReferralById, updateReferralStatus, updateReferral, deleteReferral} = require('../controllers/referralController');
const validateToken = require('../middleware/auth');

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: Get all referrals
 *     description: Retrieve a list of referrals
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of referrals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new referral
 *     description: Add a new referral to the system
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateName
 *               - candidateEmail
 *               - position
 *               - experience
 *             properties:
 *               referredUser:
 *                 type: string
 *                 description: ID of the referred user
 *               referredBy:
 *                 type: string
 *                 description: ID of the user who referred
 *     responses:
 *       201:
 *         description: Referral created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *  
 */

/**
 * @swagger
 * /api/referrals/{id}:
 *   get:
 *     summary: Get a referral by ID
 *     description: Retrieve a referral based on its ID
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral ID
 *     responses:
 *       200:
 *         description: Referral found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized, token required
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Server error
 * 
 *   put:
 *     summary: Update the referral
 *     description: Update the referral based on the ID. At least one field is required.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidateName:
 *                 type: string
 *                 description: Updated candidate name (optional)
 *               candidateEmail:
 *                 type: string
 *                 format: email
 *                 description: Updated candidate email (optional)
 *               position:
 *                 type: string
 *                 description: Updated position (optional)
 *               experience:
 *                 type: string
 *                 description: Updated experience (optional)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral ID
 *     responses:
 *       200:
 *         description: Referral updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request (At least one field required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "At least one field is required to update"
 *       401:
 *         description: Unauthorized, token required
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Server error
 *
 * 
 *   delete:
 *     summary: Delete a referral
 *     description: Deletes a referral based on the ID. Only the user who referred can delete it.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral ID to be deleted
 *     responses:
 *       200:
 *         description: Referral deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Referral deleted successfully"
 *       401:
 *         description: Unauthorized, token required
 *       403:
 *         description: Forbidden, user not allowed to delete this referral
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to delete this referral"
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/referrals/{id}/status:
 *   put:
 *     summary: Update the referral status
 *     description: Update the status of a referral based on the ID. Only authorized users can update the status.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral ID whose status needs to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['submitted', 'screening', 'interviewing', 'offered', 'hired', 'rejected']
 *                 description: "The new status of the referral (Allowed values: submitted, screening, interviewing, offered, hired, rejected)"
 *     responses:
 *       200:
 *         description: Referral status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Referral status updated successfully"
 *       400:
 *         description: Bad request (Invalid or missing status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid status. Allowed values are: submitted, screening, interviewing, offered, hired, rejected"
 *       401:
 *         description: Unauthorized, token required
 *       403:
 *         description: Forbidden, user not allowed to update this referral's status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to update this referral status"
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Server error
 */

router.post('/', validateToken, createReferral);
router.get('/', validateToken, getReferrals);
// router.get('/dashboard', validateToken, restrictTo('hr'), referralController.getDashboardStats);
router.get('/:id', validateToken, getReferralById);
router.put('/:id/status', validateToken, updateReferralStatus);
router.put('/:id', validateToken, updateReferral);
router.delete('/:id', validateToken, deleteReferral);

module.exports = router;