const express = require('express');
const router = express.Router();
const {
    getStats,
    getUsers,
    toggleBlockUser,
    deleteUser,
    getAnalytics,
    assignFaculty,
    getMappings,
    saveDeptMentor,
    saveHostelWarden,
    deleteMapping,
    recalculateAssignments,
    getUniqueDepartments,
    getUniqueHostels,
    getGPSchedules,
    createGPSchedule,
    deleteGPSchedule,
    getAcademicEvents,
    createAcademicEvent,
    updateAcademicEvent,
    deleteAcademicEvent,
    createDepartment
} = require('../controllers/adminController');

// All routes are prefixed with /api/admin
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/analytics', getAnalytics);
router.get('/mappings', getMappings);
router.get('/departments', getUniqueDepartments);
router.post('/departments', createDepartment);
router.get('/hostels', getUniqueHostels);
router.post('/dept-mentor', saveDeptMentor);
router.post('/hostel-warden', saveHostelWarden);
router.post('/recalculate-assignments', recalculateAssignments);

// GP Schedule
router.get('/gp-schedules', getGPSchedules);
router.post('/gp-schedules', createGPSchedule);
router.delete('/gp-schedules/:id', deleteGPSchedule);

// Academic Calendar
router.get('/academic-events', getAcademicEvents);
router.post('/academic-events', createAcademicEvent);
router.put('/academic-events/:id', updateAcademicEvent);
router.delete('/academic-events/:id', deleteAcademicEvent);

router.delete('/mappings/:type/:id', deleteMapping);

router.patch('/users/:id/block', toggleBlockUser);
router.patch('/users/:id/assign', assignFaculty);
router.delete('/users/:id', deleteUser);

module.exports = router;
