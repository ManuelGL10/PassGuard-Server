import mongoose, { Schema, Document } from "mongoose";

interface IPassword extends Document {
  nombre: string;
  tipo_elemento: string;
  url: string;
  password: string;
  userId: mongoose.Schema.Types.ObjectId; // Referencia al usuario
}

const Password: Schema = new Schema({
  nombre: { type: String, required: true },
  tipo_elemento: { type: String, required: true },
  url: { type: String, required: true },
  password: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Referencia al usuario
}, { collection: "Password" });

export default mongoose.model<IPassword>("Password", Password);
