import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/APiResponse.js";
import fs from "fs"
import jwt from "jsonwebtoken"
import { threadId } from "worker_threads";
import mongoose from "mongoose";
const generateAccesAndRefreshToken = async (userId) => {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})
    return {accessToken,refreshToken}
}

const registerUser = asyncHandler(async (req,res)=>{
    // will take data from frontend
    // validate the data => check required field are not empty
    // check if username and email already exists or not
    // check for images , check for avatar as it is required
    // upload them to cloudinary
    // create user object - entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response
    // console.log("I am body  ",req.body)
    const {fullName,username,email,password} = req.body
    if(
        [fullName,username,email,password].some((field) => field?.trim() === "")
    ){
        if(req.files.avatar && req.files.avatar.length > 0){
            fs.unlinkSync(req.files.avatar[0].path)
        }
        if(req.files.coverImage && req.files.coverImage.length > 0){
            fs.unlinkSync(req.files.coverImage[0].path)
        }
        throw new ApiError(400,"All fields are required")
    }
    // console.log(fullName)

    const existedUser = await User.findOne({
        $or : [{ username } , { email }]
    }
    )
    if(existedUser){
        if(req.files.avatar && req.files.avatar.length > 0){
            fs.unlinkSync(req.files.avatar[0].path)
        }
        if(req.files.coverImage && req.files.coverImage.length > 0){
            fs.unlinkSync(req.files.coverImage[0].path)
        }
        throw new ApiError(409,"User with mail or username already exists")
    }
    
    // console.log("I am req.files  ",req.files)
    let avatar_local_path = undefined
    if(req.files.avatar){
        avatar_local_path =  req.files?.avatar[0].path
    }
    
    if(!avatar_local_path){
        if(req.files.avatar && req.files.avatar.length > 0){
            fs.unlinkSync(req.files.avatar[0].path)
        }
        if(req.files.coverImage && req.files.coverImage.length > 0){
            fs.unlinkSync(req.files.coverImage[0].path)
        }
        throw new ApiError(400,"Avatar is required")
    }
    let cover_local_path = undefined
    if(req.files.coverImage){
        cover_local_path =  req.files?.coverImage[0].path
    }
    
    

    const avatar = await uploadOnCloudinary(avatar_local_path)
    const coverImage = await uploadOnCloudinary(cover_local_path)

    if(!avatar)throw new ApiError(400,"Avatar is required for cloudinary")

    const user = await User.create({
        fullName : fullName,
        username : username.toLowerCase(),
        email : email,
        password : password,
        avatar : avatar.url,
        coverImage : coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id)?.select(
        "-password -refreshToken"
    )
    if(!createdUser)throw new ApiError(500,"Error while registering the user")

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registerd Successfully")
    )

})

const loginUser = asyncHandler(async (req,res) => {
    // will take email and password from frontend
    // find the user
    // will validate it
    // if wrong give error
    // generate access and refresh token
    // send tokens through cookies
    // send response

    const {email, username , password} = req.body
    if(!(username || email)){
        throw new ApiError(400,"Username or email is required")
    }
    if(!password){
        throw new ApiError(400,"password is required")
    }
    const user = await User.findOne({
        $or : [ { username } , { email } ]
    })
    if(!user){
        throw new ApiError(404 , "User not exist. Please Register first.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect password entered")
    }
    const {accessToken,refreshToken} = await generateAccesAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(
        new ApiResponse(200,{
            user : loggedInUser,
            refreshToken : refreshToken,
            accessToken : accessToken,
        },
        "user loggedIn Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res) => {
    const user_id = req.user._id
    await User.findByIdAndUpdate(
        user_id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
        )
    const options = {
        httpOnly : true,
        secure : true
    }
    res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged out successfully"))
})



const refreshAccessToken = asyncHandler(async (req,res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request")
        }
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        
        const user = User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
        const options = {
            httpOnly : true,
            secure : true
        }
        const {accessToken,refreshToken} = await generateAccesAndRefreshToken(user._id)
        return res.status(200).
        cookie("accessToken",accessToken,options).
        cookie("refreshToken",refreshToken,options).
        json(
            new ApiResponse(200,{
                accessToken,
                refreshToken
            },"Access token refreshed")
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Something went wrong")
    }
})

const changeCurrentPassword = asyncHandler(async (req,res) =>{
    // take current password and new password from user
    // check the current password from the password saved in database
    // save new password in database
    const {oldPassword , newPassword} = req.body
    const id = req.user?._id
    const user = await User.findById(id)
    if(!user){
        throw new ApiError(400,"User not autheticated")
    }
    const check = await user.isPasswordCorrect(oldPassword)
    if(!check){
        throw new ApiError(400,"Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})
    return res.status(200).json(
        new ApiResponse(200,{},"Password changed successfully")
    )

})

const getCurrentUser = asyncHandler(async (req,res) => {
    return res.status(200).json(
        new ApiResponse(200,req.user,"Current user fetched successfully")
    )
})

const updateDetails = asyncHandler(async (req,res) => {
    const {fullName,email} = req.body
    if(!fullName && !email){
        throw new ApiError(400,"No field to update")
    }
    // const user = req.user?.id
    // if(fullName){
    //     user.fullName = fullName
    // }
    // if(email){
    //     user.email = email
    // }
    // await user.save({validateBeforeSave:false})
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName ? fullName : req.user.fullName,
                email: email ? email : req.user.email
            }
        },
        {new : true}
    ).select("-password")

    return res.
    status(200).
    json(
        new ApiResponse(200,{user},"Details updated successfully")
    )
})

const updateAvatar = asyncHandler(async (req,res) => {
    const id = req?.user._id
    let path = undefined
    if(req.file?.path){
        path = req.file?.path
    }
    if(!path){
        throw new ApiError(400,"Required avatar")
    }
    const avatar = await uploadOnCloudinary(path)
    if(!avatar?.url){
        throw new ApiError(400,"Error while uploading avatar on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select(
        "-password "
    )

    return res.status(200).json(
        new ApiResponse(200,{
            user
        },"Avatar updated successfully")
    )


})
const updateCoverImage = asyncHandler(async (req,res) => {
    const id = req?.user._id
    let path = undefined
    if(req.file?.path){
        path = req.file?.path
    }
    if(!path){
        throw new ApiError(400,"Required cover image")
    }
    const cover = await uploadOnCloudinary(path)
    if(!cover?.url){
        throw new ApiError(400,"Error while uploading cover image on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        id,
        {
            $set : {
                coverImage : cover.url
            }
        },
        {
            new : true
        }
    ).select(
        "-password"
    )

    return res.status(200).json(
        new ApiResponse(200,{
            user
        },"Cover image updated successfully")
    )


})


const getUserProfile = asyncHandler(async (req,res) => {
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }
    const channel = await User.aggregate(
        [
            {
                $match : {
                    username : username.toLowerCase()
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    foreignField : "channel",
                    localField : "_id",
                    as : "subscribers"
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    foreignField : "subscriber",
                    localField : "_id",
                    as : "subscribedTo"
                }
            },
            {
                $addFields : {
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    channelsubscribedToCount : {
                        $size : "$subscribedTo"
                    },

                    isSubscribed : {
                        $cond : {
                            if : {$in : [req.user?._id , "$subscribers.subscriber"]},
                            then : true,
                            else : false
                        }
                    }
                    
                    
                }
            },
            {
                $project : {
                    fullName : 1,
                    username : 1,
                    subscribersCount : 1,
                    channelsubscribedToCount : 1,
                    isSubscribed : 1,
                    avatar : 1,
                    coverImage : 1,
                    email : 1
                }
            }
        ]
    )
    console.log(channel)
    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist")
    }
    
    return res.status(200).json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHostory",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",

                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1
                                    },

                                    
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    console.log(user)
    return res.status(200).json(
        new ApiResponse(200,user[0].watchHistory,"Watched History fetched successfully" )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser, // auth
    refreshAccessToken, 
    changeCurrentPassword, // auth
    getCurrentUser, // auth
    updateDetails ,// auth
    updateAvatar, // multer , auth
    updateCoverImage, // multer , auth
    getUserProfile,
    getWatchHistory // auth

}