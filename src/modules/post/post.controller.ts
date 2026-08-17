import { Request, Response } from "express";
import { postServices } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
     return res.status(400).json({
        error: "Unauthorized",
      });
    }
    const result = await postServices.createPost(req.body, user.id as string);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error,
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const result = await postServices.getAllPosts();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Post retrieval failed",
      details: error,
    });
  }
};

export const postController = {
  createPost,
  getAllPosts,
};
