import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
	id: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	image: String,
	bio: String,
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	threads: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Thread'
		}
	],
	members: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	]
});

const Сommunity = mongoose.models.Сommunity || mongoose.model('Сommunity', communitySchema);

export default Сommunity;