import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"No video with this id")
    }
    if(video.isPublished){
    video.views += 1
    await video.save({validateBeforeSave : false})
    const existingLike = await Like.findOne(
        {
            "likedBy" : req?.user,
            "video" : video
        }
    )
    if(existingLike){
        const resp = await existingLike.removeLike()
        return res.status(200).json(new ApiResponse(200, resp, "Like removed successfully"));

    }
    const like = await Like.create(
        {
            likedBy : req?.user,
            video : video
        }
    )
    if(!like){
        throw new ApiError(500,"Error from backend in like in videos")
    }
    return res.status(200).json(
         new ApiResponse(200,like,"Like created successfully")
    )
    }
    throw new ApiError(400,"You can't like an unpublished video")
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"No comment with this id")
    }
    const existingLike = await Like.findOne(
        {
            "likedBy" : req?.user,
            "comment" : comment
        }
    )
    if(existingLike){
        const resp = await existingLike.removeLike()
        return res.status(200).json(new ApiResponse(200, resp, "Like removed successfully"));

    }
    const like = await Like.create(
        {
            likedBy : req?.user,
            comment : comment
        }
    )
    if(!like){
        throw new ApiError(500,"Error from backend in like in comments")
    }
    return res.status(200).json(
         new ApiResponse(200,like,"Like created successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"No tweet with this id")
    }
    const existingLike = await Like.findOne(
        {
            "likedBy" : req?.user,
            "tweet" : tweet
        }
    )
    if(existingLike){
        const resp = await existingLike.removeLike()
        return res.status(200).json(new ApiResponse(200, resp, "Like removed successfully"));

    }
    const like = await Like.create(
        {
            likedBy : req?.user,
            tweet : tweet
        }
    )
    if(!like){
        throw new ApiError(500,"Error from backend in like in tweets")
    }
    return res.status(200).json(
         new ApiResponse(200,like,"Like created successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find(
        {
            likedBy : req?.user,
            video : { $exists : true }
            
        }
    )
    if(!likedVideos || likedVideos.length==0){
        throw new ApiResponse("No liked videos")
    }
    return res.status(200).json(
        new ApiResponse(200,likedVideos,"Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}