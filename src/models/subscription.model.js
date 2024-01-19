import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const subscriptionSchema = new mongoose.Schema({
    subscriber : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
    channel : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User" 
    }
},{timestamps : true})


subscriptionSchema.methods.removeSubscriber = async function(){
    try {
        const resp = await Subscription.deleteOne(
            {
                _id : this._id
            }
        )
        console.log("Subscriber removed successfully")
        return resp
    } catch (error) {
        console.log("There was some error while removing the subscriber ", error)
        throw new ApiError(500,error)
    }
}

export const Subscription = mongoose.model("Subscription",subscriptionSchema)