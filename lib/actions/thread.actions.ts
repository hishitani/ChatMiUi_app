"use server"

import { connectToDB } from "../mongoose";

import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";



interface Params {

	text: string,
	author: string,
	communityId: string | null,
	path: string,

}

export async function createThread(
	{
		text,
		author,
		communityId,
		path
	}: Params) {

	try {
		connectToDB()

		const createThread = await Thread.create({
			text,
			author,
			community: null,
		});

		// Update user model

		await User.findByIdAndUpdate(author, {
			$push: { threads: createThread._id }
		})

		revalidatePath(path)

	} catch (error: any) {
		throw new Error(`Error creating thread: ${error.message}`)
	}



}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	connectToDB();

	// Calculate the number of posts to skip
	const skipAmount = (pageNumber - 1) * pageSize;

	// Fetch the posts that have no parants (tio-level threads...)
	const postsQuery = Thread.find({ parantId: { $in: [null, undefined] } })
		.sort({ createdAr: 'desc' })
		.skip(skipAmount)
		.limit(pageSize)
		.populate({ path: 'author', model: User })
		.populate({
			path: 'children',
			populate: {
				path: 'author',
				model: User,
				select: "_id name parentId image"
			}
		});

	const totalPostsCount = await Thread.countDocuments({ parantId: { $in: [null, undefined] } });

	const posts = await postsQuery.exec();

	const isNext = totalPostsCount > skipAmount + posts.length;

	return { posts, isNext };
}

export async function fetchThreadById(id: string) {
	connectToDB();

	try {
		// TODO: Populate Community

		const thread = await Thread.findById(id)
			.populate({
				path: 'author',
				model: User,
				select: "_id id name image"
			})
			.populate({
				path: 'children',
				populate: [
					{
						path: 'author',
						model: User,
						select: "_id id name parentId image"
					},
					{
						path: 'children',
						model: Thread,
						populate: {
							path: 'author',
							model: User,
							select: "_id id name parentId image"
						}
					}
				]
			}).exec();
		return thread;
	} catch (error: any) {
		throw new Error(`Error fetching thread: ${error.message}`)
	}
}


export async function addCommentToThread(
	threadId: string,
	commentText: string,
	userId: string,
	path: string
) {
	connectToDB();

	try {

		const originalThread = await Thread.findById(threadId);

		if (!originalThread) {
			throw new Error("Thread not found")
		}

		// Creat a new thread with the comment text

		const commentThread = new Thread({
			text: commentText,
			author: userId,
			parentId: threadId
		})

		// Save The new Thread

		const savedCommentThread = await commentThread.save();

		// Update the original thread

		originalThread.children.push(savedCommentThread._id)

		// Save the original thread

		await originalThread.save();

		revalidatePath(path);

	} catch (error: any) {
		throw new Error(`Error fetching thread: ${error.message}`)
	}
}