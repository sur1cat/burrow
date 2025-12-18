interface ThreadCardProps {
    post: {
        id: string;
        title: string;
        content: string;
        author: string;
    };
}

export default function ThreadCard({ post }: ThreadCardProps) {
    return (
        <div className="border p-4 rounded shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p className="text-gray-700">{post.content}</p>
            <p className="text-gray-500 text-sm mt-2">By {post.author}</p>
        </div>
    );
}
