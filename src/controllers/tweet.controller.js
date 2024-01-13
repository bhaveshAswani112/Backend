import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    console.log(content)
    if(!content){
        throw new ApiError(400,"Can not tweet without content")
    }
    const tweet = await Tweet.create({
        content : content,
        owner : req?.user
    })
    if(!tweet){
        throw new ApiError(500,"Error from backend side")
    }
    return res.status(200).json(
        new ApiResponse(200,{tweet},"Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if(!tweetId){
        throw new ApiError(400,"Did not get tweet Id")
    }
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"Nothing to update")
    }
    let tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"No tweet found with this Id")
    }
    tweet.content = content
    await tweet.save({validateBeforeSave : false})
    return res.status(200).json(
        new ApiResponse(200,{tweet},"Tweet updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if(!tweetId){
        throw new ApiError(400,"Did not get tweet Id")
    }
    let tweet = await Tweet.findByIdAndDelete(tweetId)
    if(!tweet){
        throw new ApiError(400,"No tweet with this id exists")
    }
    return res.status(200).json(
        new ApiResponse(200,{tweet},"Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
