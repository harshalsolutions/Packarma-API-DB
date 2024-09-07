import express from 'express';

import {
    getPageController,
    updatePageController,
    deletePageController,
    addPageController,
    getAllPagesController
} from "../../../controllers/Admin/Staff/PagesController.js";

const router = express.Router();

router.post('/pages', addPageController);
router.get('/pages', getAllPagesController);
router.get('/pages/:pageId', getPageController);
router.put('/pages/:pageId', updatePageController);
router.delete('/pages/:pageId', deletePageController);

export default router;
