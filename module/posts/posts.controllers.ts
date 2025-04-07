import { Request, Response } from "express";
import { PrismaClient, Post } from "@prisma/client";
import upload from "../../config/multer.config";
import fs from "fs";
import path from "path";
import { getImageUrl } from "../../utils/base_utl";

const prisma = new PrismaClient();

// export const createPost = async (req: Request, res: Response) => {
//   try {
//     const { descriptions } = req.body;

//     if (!descriptions) {
//       res.status(400).json({ message: "descriptions are required" });
//     }

//     const post = await prisma.post.create({
//       data: {
//         image: req.file.filename,
//         descriptions,
//       },
//     });

//     const image = getImageUrl(`/uploads/${post.image}`);

//     res.status(201).json({
//       success: true,
//       message: "Post created successfully",
//       post: {
//         ...post,
//         image,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error,
//     });
//   }
// };


export const createPost = async (req: Request, res: Response) => {
  console.log("hello")
  try {
    const { descriptions_en, descriptions_de } = req.body;

    if (!descriptions_en && !descriptions_de) {
      res.status(400).json({ message: "Minimum one description is required" });
      return;
    }

    const post = await prisma.post.create({
      data: {
        image: req.file.filename,
        descriptions_en,
        descriptions_de,
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
    if (req.file) {
      const imagePath = path.join(__dirname, "../../uploads", req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};



// export const getAllPosts = async (req: Request, res: Response) => {

//   try {
//     let { page = "1", limit = "5" } = req.query;

//     const pageNumber = parseInt(page as string, 10);
//     const limitNumber = parseInt(limit as string, 10);
//     const skip = (pageNumber - 1) * limitNumber;

//     const totalPosts = await prisma.post.count();
//     const totalPages = Math.ceil(totalPosts / limitNumber);

//     const posts = await prisma.post.findMany({
//       skip,
//       take: limitNumber,
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const nextPage = pageNumber < totalPages;

//     res.status(200).json({
//       success: true,
//       message: "Posts retrieved successfully",
//       currentPage: pageNumber,
//       totalPages,
//       totalPosts,
//       nextPage,
//       posts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error,
//     });
//   }
// };



export const getAllPosts = async (req: Request, res: Response) => {
  try {
    let { page = "1", limit = "5" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / limitNumber);

    const posts = await prisma.post.findMany({
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map through posts to add full image URL
    const postsWithFullImagePath = posts.map(post => ({
      ...post,
      image: getImageUrl(`/uploads/${post.image}`)
    }));

    const nextPage = pageNumber < totalPages;

    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      currentPage: pageNumber,
      totalPages,
      totalPosts,
      nextPage,
      posts: postsWithFullImagePath,
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
    console.log(id)
    const post = await prisma.post.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!post) {
      res.status(404).json({
        message: "Post not found",
      });
      return;
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



export const searchPosts = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    console.log("Search query:", query);

    if (!query) {
       res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return
    }

    const posts = await prisma.$queryRaw`
      SELECT * FROM posts
      WHERE descriptions::text ILIKE ${'%' + query + '%'}
      ORDER BY "createdAt" DESC
    `;

    console.log("Found Posts:", posts);

    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      posts,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// export const getSearchPosts = async (req: Request, res: Response) => {
//   try {
//     const { query } = req.query;
//     if (!query) {
//       res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//       return;
//     }

//     const posts = await prisma.$queryRaw`
//       SELECT * FROM "posts"
//       WHERE descriptions::text ILIKE ${"%" + query + "%"}
//       ORDER BY "created_at" DESC
//     `;

//     res.status(200).json({
//       success: true,
//       message: "Search results retrieved successfully",
//       totalResults: posts,
//       posts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error,
//     });
//   }
// };

// export const updatePost = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { descriptions } = req.body;
//     const newImage = req.file;

//     const existingPost = await prisma.post.findUnique({
//       where: {
//         id: String(id),
//       },
//     });

//     if (!existingPost) {
//       res.status(404).json({
//         message: "Post not found",
//       });
//     }

//     if (newImage && existingPost.image) {
//       const oldImagePath = path.join(
//         __dirname,
//         "../../uploads",
//         existingPost.image
//       );

//       if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
//     }

//     const updatedPost = await prisma.post.update({
//       where: { id: String(id) },
//       data: {
//         image: newImage ? newImage.filename : existingPost.image,
//         descriptions: descriptions || existingPost.descriptions,
//       },
//     });

//     const imageUrl = getImageUrl(`/uploads/${updatedPost.image}`);

//     res.status(200).json({
//       success: true,
//       message: "Post updated successfully",
//       post: {
//         ...updatedPost,
//         imageUrl,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error,
//     });
//   }
// };

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { descriptions_en, descriptions_de } = req.body;
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
      return;
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
        descriptions_en: descriptions_en || existingPost.descriptions_en,
        descriptions_de: descriptions_de || existingPost.descriptions_de,
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
    if (req.file) {
      const imagePath = path.join(__dirname, "../../uploads", req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
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
