import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    let {page = 1, limit = 10} = req.query

    page = parseInt(page)
    limit = parseInt(limit)

    let skip = (page-1)*limit
    const comments = await Comment.find(
        {
            "video" : videoId
        }
    ).
    skip(skip).
    limit(limit)
    if(!comments || comments.length==0){
        throw new ApiError(400,"No comments for this video")
    }
    return res.status(200).json(
        new ApiResponse(200,comments,"All comments fetched")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    if(!content){
        throw new ApiError(400,"Can't comment without any content")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"No video available with this id")
    }
    const comment = await Comment.create({
        content : content,
        owner : req?.user,
        video : video
    })
    if(!comment){
        throw new ApiError(500,"Error from backend side while uploading comment")
    }
    return res.status(200).json(
        new ApiResponse(200,comment,"Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params
    if(!content){
        throw new ApiError(400,"Can't update comment without any content")
    }
    
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"No comment available with this id")
    }
    comment.content = content
    await comment.save({validateBeforeSave : false})
    return res.status(200).json(
        new ApiResponse(200,comment,"Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new ApiError(400,"No comment available with this id")
    }
    return res.status(200).json(
        new ApiResponse(200,comment,"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
