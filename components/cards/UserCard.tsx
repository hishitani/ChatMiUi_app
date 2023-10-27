"use client"

import Image from "next/image"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"


interface Props {
	id: string,
	name: string,
	username: string,
	imgUrl: string,
	personType: string,
}

const UserCard = ({
	id,
	name,
	username,
	imgUrl,
	personType
}: Props) => {

	const router = useRouter();

	return (
		<article className="user-card">
			<div className="user-card__avatar">
				<Image
					src={imgUrl}
					alt="User Avatar"
					width={48}
					height={48}
					className="rounded-full"
				/>
				<div className="flex-1 text-ellipsis">
					<h2 className="text-base-semibold text-light-1">{name}</h2>
					<p className="text-small-medium text-gray-1">@{username}</p>
				</div>
			</div>
			<Button className="user-card__btn" onClick={() => router.push(`/profile/${id}`)}>
				View
			</Button>
		</article>
	)
}

export default UserCard
