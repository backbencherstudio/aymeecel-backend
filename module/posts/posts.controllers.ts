import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import upload from "../../config/multer.config";
import fs from "fs";
import path from "path";
import { getImageUrl } from "../../utils/base_utl";

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  try {
    const { descriptions } = req.body;

    if (!descriptions) {
      res.status(400).json({ message: "descriptions are required" });
    }

    const post = await prisma.post.create({
      data: {
        image: req.file.filename,
        descriptions,
      },
    });

    const image = getImageUrl(`/uploads/${post.image}`);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: {
        ...post,
        image,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const getSinglePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!post) {
      res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { descriptions } = req.body;
    const newImage = req.file;

    const existingPost = await prisma.post.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!existingPost) {
      res.status(404).json({
        message: "Post not found",
      });
    }

    if (newImage && existingPost.image) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads",
        existingPost.image
      );

      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    const updatedPost = await prisma.post.update({
      where: { id: String(id) },
      data: {
        image: newImage ? newImage.filename : existingPost.image,
        descriptions: descriptions || existingPost.descriptions,
      },
    });

    const imageUrl = getImageUrl(`/uploads/${updatedPost.image}`);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: {
        ...updatedPost,
        imageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { id: String(id) },
    });

    if (!existingPost) {
      res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.image) {
      const imagePath = path.join(
        __dirname,
        "../../uploads",
        existingPost.image
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.post.delete({
      where: { id: String(id) },
    });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Something went wrong",
        error,
      });
    }
  }
};
