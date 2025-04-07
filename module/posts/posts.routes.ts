import express from "express";
import { createPost, getAllPosts, getSinglePost, updatePost, deletePost, searchPosts  } from "./posts.controllers";
import upload from "../../config/multer.config";
import verifyUser from "../../middleware/verifyUsers";

const router = express.Router();


router.post("/create", verifyUser, upload.single("image"), createPost);

router.get("/get-all-post", getAllPosts);

router.get("/search", searchPosts);

router.get("/:id", getSinglePost);


router.put("/:id", verifyUser, upload.single("image"), updatePost);

router.delete("/:id", verifyUser, deletePost);


export default router;
