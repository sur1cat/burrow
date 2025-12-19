interface CommentProps {
    comment: {
        id: string;
        author: string;
        text: string;
    };
}

export default function Comment({ comment }: CommentProps) {
    return (
        <div className="thread-comment">
            <p className="text-gray-800">{comment.text}</p>
            <p className="text-gray-500 text-sm">- {comment.author}</p>
        </div>
    );
}
