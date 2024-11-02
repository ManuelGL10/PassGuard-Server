import mongoose from "mongoose";
const {Schema} = mongoose; 

const Suscription = new Schema({
    endpoint:{ type:String, required: true},
    expirationTime: { type: Date, default:null},
    keys:{
        p256dh: { type:String, required: true},
        auth: { type:String, required: true}, 
    },
},{collection: "Suscription"});

export default mongoose.model("Suscription", Suscription); 