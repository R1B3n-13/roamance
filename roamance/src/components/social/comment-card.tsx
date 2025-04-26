import { Comment, User } from '@/types';
import { MoreHorizontal, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CommentCardProps {
  comment: Comment;
  currentUser?: User;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}

export const CommentCard = ({ comment, onLike, onReply }: CommentCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(comment.id);
  };

  return (
    <div className="flex gap-3 group animate-in fade-in">
      <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={
            comment.user.profile_image_url ||
            '/images/roamance-logo-no-text.png'
          }
          alt={comment.user.full_name || 'User'}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-full"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white">
              {comment.user.full_name}
            </h4>
            <button className="p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">
            {comment.text}
          </p>

          {comment.image_path && (
            <div className="mt-2 rounded-lg overflow-hidden">
              <Image
                src={comment.image_path}
                alt="Comment attachment"
                width={200}
                height={150}
                className="object-cover"
              />
            </div>
          )}

          {comment.video_path && (
            <div className="mt-2 rounded-lg overflow-hidden">
              <video
                src={comment.video_path}
                controls
                preload="metadata"
                className="max-w-full h-auto"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-2 mt-1 text-xs">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors',
              isLiked
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            <ThumbsUp
              className={cn(
                'h-3.5 w-3.5',
                isLiked ? 'fill-purple-600 dark:fill-purple-400' : ''
              )}
            />
            <span>Like</span>
          </button>

          <button
            onClick={() => onReply && onReply(comment.id)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <span>Reply</span>
          </button>

          <span className="text-gray-400 dark:text-gray-500">
            {new Date(comment.audit.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
