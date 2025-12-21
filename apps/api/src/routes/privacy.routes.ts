import express from 'express';
import {
    requestPrivacyAccess,
    getPrivacyData,
    deletePrivacyData,
} from '../controllers/privacy.controller.js';

const router: express.Router = express.Router();

/**
 * @route POST /api/privacy/access
 * @desc Request access/deletion link ( sends email )
 * @access Public
 */
router.post('/access', requestPrivacyAccess);

/**
 * @route GET /api/privacy/data
 * @desc Get user data (JSON export)
 * @access Protected (JWT Token)
 */
router.get('/data', getPrivacyData);

/**
 * @route DELETE /api/privacy/data
 * @desc Delete/Anonymize user data
 * @access Protected (JWT Token)
 */
router.delete('/data', deletePrivacyData);

export const privacyRouter = router;
