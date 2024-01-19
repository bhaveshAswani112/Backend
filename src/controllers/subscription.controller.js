import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const channel  = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"Channel does not exist")
    }
    const existing = await Subscription.findOne(
        {
            channel : channelId,
            subscriber : req?.user
        }
    )
    if(existing){
        const resp = await existing.removeSubscriber()
        return res.status(200).json(
            new ApiResponse(200,resp,"Channel Unsubscribed successfully")
        )
    }
    const subs = await Subscription.create({
        subscriber : req?.user,
        channel : channel
    })

    return res.status(200).json(
        new ApiResponse(200,subs,"Channel subscribed successfully.")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await  Subscription.find(
        {channel : channelId}
    )
    return res.status(200).json(
        new ApiResponse(200,subscribers,"Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    const subscribedTo = await  Subscription.find(
        {subscriber : subscriberId}
    )
    return res.status(200).json(
        new ApiResponse(200,subscribedTo,"Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}