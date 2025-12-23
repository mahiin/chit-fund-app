import mongoose, { Schema, Document } from 'mongoose';

export interface IWinnerHistory {
  memberId: string;
  memberName: string;
  dateWon: Date;
  amount: number;
}

export interface IChitSet extends Document {
  name: string; // e.g., "50K Group"
  totalMembers: number; // 200
  drawDate: number; // Day of month (1-31)
  monthlyAmount: number;
  activeMembers: mongoose.Types.ObjectId[];
  winnerHistory: IWinnerHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const WinnerHistorySchema: Schema = new Schema({
  memberId: {
    type: String,
    required: true,
  },
  memberName: {
    type: String,
    required: true,
  },
  dateWon: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const ChitSetSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  totalMembers: {
    type: Number,
    required: true,
  },
  drawDate: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  monthlyAmount: {
    type: Number,
    required: true,
  },
  activeMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'Member',
  }],
  winnerHistory: [WinnerHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ChitSetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.ChitSet || mongoose.model<IChitSet>('ChitSet', ChitSetSchema);


