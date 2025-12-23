import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  name: string;
  memberId: string; // AGR + 4 digits + Letter
  mobile: string;
  email: string;
  location: string;
  aadhar: string;
  createdAt: Date;
}

const MemberSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  memberId: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  aadhar: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);


