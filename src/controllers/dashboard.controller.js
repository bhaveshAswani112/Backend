import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const stats = await Video.aggregate(
        [
            {
                $match : {
                    owner : req?.user._id
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "owner",
                    foreignField : "channel",
                    as : "subscribers"
                }
            },
            {
                $lookup : {
                    from : "likes",
                    localField : "_id",
                    foreignField : "video",
                    as : "likes"
                }
            },
            {
                $addFields : {
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    likesCount : {
                        $size : "$likes"
                    },

                },
                
            },
            {
                $group : {
                    _id : null,
                    subscribersCount : {$first : "$subscribersCount"},
                    likesCount : {$sum : "$likesCount"},
                    totalViews : {$sum : "$views"},
                    totalVideos : {$sum : 1}
                }
            },
            {
                $project : {
                    subscribersCount : 1,
                    likesCount : 1,
                    totalVideos : 1,
                    totalViews : 1

                }
            }
        ]
    )
    return res.status(200).json(
        new ApiResponse(200,stats,"Stats fetched successfully")
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find(
        {
            owner : req?.user
        }
    )
    if(!videos || videos.length==0){
        throw new ApiError(400,"No videos found for this channel")
    }
    return res.status(200).json(
        new ApiResponse(200,videos,"Videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }